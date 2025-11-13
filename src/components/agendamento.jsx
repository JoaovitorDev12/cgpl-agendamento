import { useState, useEffect } from 'react'

export default function Agendamento() {
  const [services, setServices] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    propertyAddress: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    problemDescription: ''
  })

  // Carregar serviços
  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch('/api/services')
        const servicesData = await response.json()
        setServices(servicesData)
      } catch (error) {
        console.error('Erro ao carregar serviços:', error)
      }
    }
    loadServices()
  }, [])

  // Carregar horários quando data ou serviço mudar
  useEffect(() => {
    if (selectedDate && selectedService) {
      const loadSlots = async () => {
        try {
          const response = await fetch(
            `/api/slots?date=${selectedDate}&serviceId=${selectedService}`
          )
          const slotsData = await response.json()
          setAvailableSlots(slotsData)
        } catch (error) {
          console.error('Erro ao carregar horários:', error)
        }
      }
      loadSlots()
    }
  }, [selectedDate, selectedService])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Agendamento confirmado! Nossa equipe entrará em contato.')
        
        // Limpar formulário
        setFormData({
          name: '',
          propertyAddress: '',
          email: '',
          phone: '',
          service: '',
          date: '',
          time: '',
          problemDescription: ''
        })
        setAvailableSlots([])
      } else {
        alert('❌ Erro ao agendar: ' + result.error)
      }
    } catch (error) {
      alert('❌ Erro ao processar agendamento')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'date') setSelectedDate(value)
    if (name === 'service') setSelectedService(value)
  }

  return (
    <section id="agendamento" className="agendamento-section">
      <div className="container">
        <h2>Agende um Serviço Predial</h2>
        <p className="section-subtitle">Solicite manutenção e reparos para seu condomínio ou prédio</p>
        
        <form onSubmit={handleSubmit} className="agendamento-form">
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Seu Nome Completo"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="propertyAddress"
              placeholder="Endereço Completo do Prédio"
              value={formData.propertyAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Seu E-mail"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Telefone/WhatsApp"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <select 
              name="service" 
              value={formData.service}
              onChange={handleChange}
              required
            >
              <option value="">Tipo de Serviço</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - R$ {service.price}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <select 
                name="time" 
                value={formData.time}
                onChange={handleChange}
                required
                disabled={!availableSlots.length}
              >
                <option value="">Horário Disponível</option>
                {availableSlots.map(slot => (
                  <option key={slot.id} value={slot.time}>
                    {slot.time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <textarea
              name="problemDescription"
              placeholder="Descreva o problema ou serviço necessário..."
              value={formData.problemDescription}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          {!availableSlots.length && selectedDate && selectedService && (
            <p className="info-text">⚠️ Nenhum horário disponível para esta data e serviço</p>
          )}

          <button type="submit" className="btn-agendar">
            ✅ Solicitar Serviço
          </button>
        </form>
      </div>
    </section>
  )
}