import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { 
      name, 
      propertyAddress, 
      email, 
      phone, 
      service, 
      date, 
      time, 
      problemDescription
    } = req.body

    try {
      // 1. Encontrar o slot disponível
      const { data: slots, error: slotError } = await supabase
        .from('available_slots')
        .select('id')
        .eq('date', date)
        .eq('time', time)
        .eq('service_id', service)
        .eq('is_available', true)
        .single()

      if (slotError || !slots) {
        return res.status(400).json({ error: 'Horário não disponível para este serviço' })
      }

      // 2. Criar agendamento
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert([
          {
            client_name: name,
            property_address: propertyAddress,
            client_email: email,
            client_phone: phone,
            service_id: service,
            slot_id: slots.id,
            problem_description: problemDescription,
            status: 'scheduled'
          }
        ])
        .select()

      if (appointmentError) throw appointmentError

      // 3. Marcar slot como indisponível
      const { error: updateError } = await supabase
        .from('available_slots')
        .update({ is_available: false })
        .eq('id', slots.id)

      if (updateError) throw updateError

      res.status(200).json({ 
        success: true, 
        appointment: appointment[0],
        message: 'Agendamento confirmado! Nossa equipe entrará em contato.' 
      })

    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}