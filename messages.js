require('dotenv').config()
const { addKeyword } = require('@bot-whatsapp/bot')
const Agenda = require('agenda')

// Configura la conexión a la base de datos para Agenda
const agenda = new Agenda({ db: { address: process.env.MONGO_CONNECTION_STRING } })

// Define una tarea de agenda para programar una cita
agenda.define('schedule appointment', async (job) => {
  const { service, time } = job.attrs.data
  console.log(`Scheduled appointment for ${service} at ${time}`)
})

// Escucha el evento 'success' para saber cuándo se ha completado una cita
agenda.on('success:schedule appointment', (job) => {
  console.log(`Appointment for ${job.attrs.data.service} at ${job.attrs.data.time} completed successfully`)
})

let selectedService = null

const flowService = addKeyword(['1', '2']).addAnswer((message) => {
  selectedService = message.body === '1' ? 'Barba' : 'Corte de cabello'
  const price = message.body === '1' ? '6000 colones' : '5000 colones'
  return `Has seleccionado ${selectedService} que tiene un costo de ${price}. Por favor, selecciona un horario para tu cita.`
})

const flowSchedule = addKeyword(['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']).addAnswer(async (message) => {
  const time = message.body
  // Programa la cita utilizando Agenda
  try {
    await agenda.schedule(time, 'schedule appointment', { service: selectedService, time })
    return `Tu cita ha sido agendada para las ${time}. ¡Te esperamos!`
  } catch (error) {
    console.error('Failed to schedule appointment:', error)
    return 'Lo siento, hubo un error al programar tu cita. Por favor, inténtalo de nuevo más tarde.'
  }
})

const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
  .addAnswer('🙌 Hola, bienvenido a nuestra Barbería. ¿Qué servicio te gustaría agendar hoy?')
  .addAnswer(
    [
      '1. Barba - 6000 colones',
      '2. Corte de cabello - 5000 colones',
    ],
    null,
    null,
    [flowService]
  )

module.exports = { flowPrincipal }
