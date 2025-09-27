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
  CONSTRAINT whatsapp_user_unique UNIQUE (user_id, whatsapp)
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
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

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
$$ LANGUAGE plpgsql SET search_path = public;

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

-- Indexes
CREATE INDEX idx_profiles_whatsapp_last4 ON public.profiles(whatsapp_last4);
CREATE INDEX idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX idx_service_requests_user_id ON public.service_requests(user_id);
CREATE INDEX idx_service_requests_status ON public.service_requests(status);
CREATE INDEX idx_service_requests_priority ON public.service_requests(priority);
CREATE INDEX idx_service_requests_created_at ON public.service_requests(created_at DESC);
