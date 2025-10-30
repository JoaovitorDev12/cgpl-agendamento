-- Tipos ENUM para status e prioridade
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE request_status AS ENUM ('pending', 'scheduled', 'in-progress', 'completed');
CREATE TYPE payment_method_type AS ENUM ('pix', 'cash', 'card', 'transfer', 'boleto');

-- Tabela de perfis
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  whatsapp_last4 TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT whatsapp_user_unique UNIQUE (user_id, whatsapp),
  CONSTRAINT valid_whatsapp_format CHECK (whatsapp ~ '^\+55[1-9]{2}9[0-9]{8}$')
);

-- Tabela de solicitações de serviço
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority priority_level NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  requester TEXT NOT NULL,
  contact TEXT NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  scheduled_days INTEGER,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  payment_amount DECIMAL(10,2),
  payment_due_date TIMESTAMP WITH TIME ZONE,
  payment_is_paid BOOLEAN DEFAULT false,
  payment_paid_at TIMESTAMP WITH TIME ZONE,
  payment_method payment_method_type,
  payment_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_payment_amount CHECK (payment_amount IS NULL OR payment_amount >= 0),
  CONSTRAINT valid_scheduled_days CHECK (scheduled_days IS NULL OR scheduled_days > 0)
);

-- Adicionar Foreign Key
ALTER TABLE public.service_requests 
ADD CONSTRAINT fk_service_requests_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policies para service_requests
CREATE POLICY "Users can view their own service requests" 
ON public.service_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service requests" 
ON public.service_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service requests" 
ON public.service_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Função de update automático para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para profiles.updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para service_requests.updated_at
CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função e trigger para preencher whatsapp_last4
CREATE OR REPLACE FUNCTION fill_whatsapp_last4()
RETURNS TRIGGER AS $$
BEGIN
  NEW.whatsapp_last4 := right(NEW.whatsapp, 4);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fill_whatsapp_last4
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION fill_whatsapp_last4();

-- Indexes originais
CREATE INDEX idx_profiles_whatsapp_last4 ON public.profiles(whatsapp_last4);
CREATE INDEX idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX idx_service_requests_user_id ON public.service_requests(user_id);
CREATE INDEX idx_service_requests_status ON public.service_requests(status);
CREATE INDEX idx_service_requests_priority ON public.service_requests(priority);
CREATE INDEX idx_service_requests_created_at ON public.service_requests(created_at DESC);

-- Novos indexes sugeridos
CREATE INDEX idx_service_requests_category ON public.service_requests(category);
CREATE INDEX idx_service_requests_location ON public.service_requests(location);
CREATE INDEX idx_service_requests_payment_status ON public.service_requests(payment_is_paid, payment_due_date);
CREATE INDEX idx_service_requests_priority_status ON public.service_requests(priority, status);

-- Funções úteis adicionais

-- Função para buscar requests por status e priority
CREATE OR REPLACE FUNCTION get_requests_by_status_priority(
  p_status request_status DEFAULT NULL,
  p_priority priority_level DEFAULT NULL
)
RETURNS SETOF public.service_requests AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.service_requests
  WHERE 
    (p_status IS NULL OR status = p_status) AND
    (p_priority IS NULL OR priority = p_priority)
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para estatísticas do usuário
CREATE OR REPLACE FUNCTION get_user_request_stats(user_uuid UUID)
RETURNS TABLE(
  total_requests BIGINT,
  pending_requests BIGINT,
  completed_requests BIGINT,
  total_payment_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_requests,
    COALESCE(SUM(payment_amount) FILTER (WHERE payment_is_paid = true), 0) as total_payment_value
  FROM public.service_requests
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar status de pagamento
CREATE OR REPLACE FUNCTION mark_payment_as_paid(
  request_id UUID,
  payment_method_param payment_method_type,
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.service_requests
  SET 
    payment_is_paid = true,
    payment_paid_at = paid_at,
    payment_method = payment_method_param,
    updated_at = NOW()
  WHERE id = request_id;
END;
$$ LANGUAGE plpgsql;

-- Função para completar um serviço
CREATE OR REPLACE FUNCTION complete_service_request(
  request_id UUID,
  completion_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.service_requests
  SET 
    status = 'completed',
    completed_at = completion_time,
    updated_at = NOW()
  WHERE id = request_id;
END;
$$ LANGUAGE plpgsql;

-- Views úteis

-- View para relatórios completos
CREATE OR REPLACE VIEW service_requests_report AS
SELECT 
  sr.*,
  p.first_name,
  p.last_name,
  p.email,
  p.whatsapp,
  CASE 
    WHEN sr.payment_due_date < NOW() AND sr.payment_is_paid = false THEN 'overdue'
    ELSE 'on_time'
  END as payment_status
FROM public.service_requests sr
JOIN public.profiles p ON sr.user_id = p.user_id;

-- View para dashboard
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
  p.user_id,
  p.first_name,
  p.last_name,
  p.email,
  p.whatsapp,
  COUNT(sr.id) as total_requests,
  COUNT(sr.id) FILTER (WHERE sr.status = 'pending') as pending_count,
  COUNT(sr.id) FILTER (WHERE sr.status = 'scheduled') as scheduled_count,
  COUNT(sr.id) FILTER (WHERE sr.status = 'in-progress') as in_progress_count,
  COUNT(sr.id) FILTER (WHERE sr.status = 'completed') as completed_count,
  COALESCE(SUM(sr.payment_amount) FILTER (WHERE sr.payment_is_paid = true), 0) as total_revenue
FROM public.profiles p
LEFT JOIN public.service_requests sr ON p.user_id = sr.user_id
GROUP BY p.user_id, p.first_name, p.last_name, p.email, p.whatsapp;

-- View para pagamentos pendentes
CREATE OR REPLACE VIEW pending_payments AS
SELECT 
  sr.id as request_id,
  sr.title,
  sr.payment_amount,
  sr.payment_due_date,
  sr.payment_method,
  p.first_name,
  p.last_name,
  p.whatsapp,
  p.email,
  CASE 
    WHEN sr.payment_due_date < NOW() THEN 'overdue'
    WHEN sr.payment_due_date <= (NOW() + INTERVAL '3 days') THEN 'due_soon'
    ELSE 'future'
  END as payment_urgency
FROM public.service_requests sr
JOIN public.profiles p ON sr.user_id = p.user_id
WHERE sr.payment_is_paid = false 
  AND sr.payment_amount IS NOT NULL 
  AND sr.payment_amount > 0;

-- Dados de exemplo para teste (opcional)
INSERT INTO public.profiles (user_id, first_name, last_name, whatsapp, email) VALUES
('11111111-1111-1111-1111-111111111111', 'João', 'Silva', '+5511999999999', 'joao.silva@email.com'),
('22222222-2222-2222-2222-222222222222', 'Maria', 'Santos', '+5511888888888', 'maria.santos@email.com');

INSERT INTO public.service_requests (
  user_id, title, description, priority, category, location, requester, contact, 
  status, payment_amount, payment_due_date, payment_method
) VALUES
('11111111-1111-1111-1111-111111111111', 'Reparo no Ar Condicionado', 
 'Ar condicionado não está gelando', 'high', 'Manutenção', 'Sala Principal', 
 'João Silva', '+5511999999999', 'completed', 250.00, '2024-01-20 18:00:00', 'pix'),

('11111111-1111-1111-1111-111111111111', 'Instalação de Prateleiras', 
 'Instalar 3 prateleiras na parede da cozinha', 'medium', 'Instalação', 'Cozinha', 
 'João Silva', '+5511999999999', 'in-progress', 150.00, '2024-01-25 18:00:00', 'cash'),

('22222222-2222-2222-2222-222222222222', 'Pintura do Quarto', 
 'Pintar as paredes do quarto principal', 'low', 'Pintura', 'Quarto Principal', 
 'Maria Santos', '+5511888888888', 'pending', 800.00, '2024-02-01 18:00:00', 'transfer');

-- Comentários para documentação
COMMENT ON TABLE public.profiles IS 'Tabela de perfis de usuários do sistema';
COMMENT ON TABLE public.service_requests IS 'Tabela de solicitações de serviço';
COMMENT ON COLUMN public.profiles.whatsapp_last4 IS 'Últimos 4 dígitos do WhatsApp para busca rápida';
COMMENT ON COLUMN public.service_requests.payment_notes IS 'Observações adicionais sobre o pagamento';

-- Grant permissions (ajuste conforme necessário)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;