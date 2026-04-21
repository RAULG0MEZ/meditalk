import type { Step } from '../types/form'

export const STEPS: Step[] = [
  {
    id: 1,
    question: '¿Dónde publicarás tu contenido?',
    field: 'publicationType',
    type: 'radio',
    options: [
      {
        value: 'paid_ads',
        label: 'Anuncios de paga',
        description: 'Facebook Ads, Google Ads, Instagram Ads, etc.',
      },
      {
        value: 'organic',
        label: 'Contenido orgánico',
        description: 'Redes sociales, blog, YouTube, etc.',
      },
    ],
  },
  {
    id: 2,
    question: '¿En qué te especializas?',
    field: 'specialty',
    type: 'text',
    placeholder: 'Ej. Cardiología, Dermatología, Medicina General...',
  },
  {
    id: 3,
    question: '¿En qué ciudad o estado te encuentras?',
    field: 'location',
    type: 'text',
    placeholder: 'Ej. Ciudad de México, Guadalajara, Monterrey...',
  },
  {
    id: 4,
    question: '¿Cuál es el nombre del Hospital, clínica o consultorio?',
    field: 'clinicName',
    type: 'text',
    placeholder: 'Ej. Clínica San Rafael, Consultorio Dr. García...',
    optional: true,
  },
  {
    id: 5,
    question: '¿A quién ayudas y qué problema o condición deseas tratar en tus pacientes?',
    field: 'targetAudience',
    type: 'textarea',
    placeholder: 'Ej. Adultos mayores con hipertensión y problemas cardíacos...',
  },
  {
    id: 6,
    question: '¿Qué te hace único como médico?',
    field: 'uniqueness',
    type: 'textarea',
    placeholder: 'Ej. 15 años de experiencia, enfoque integral, atención personalizada...',
  },
  {
    id: 7,
    question: '¿Tienes algún método o tratamiento único?',
    field: 'uniqueMethod',
    type: 'textarea',
    placeholder: 'Ej. Protocolo propio de rehabilitación, técnica mínimamente invasiva...',
  },
  {
    id: 8,
    question: '¿Cuántos pacientes has atendido?',
    field: 'patientCount',
    type: 'text',
    placeholder: 'Ej. Más de 500 pacientes, 1,200 consultas...',
  },
  {
    id: 9,
    question: '¿Tienes premios o testimonios?',
    field: 'awardsTestimonials',
    type: 'textarea',
    placeholder: 'Ej. Premio Nacional de Medicina 2022, "El Dr. me cambió la vida" - Juan P...',
  },
  {
    id: 10,
    question: '¿Qué estás ofreciendo?',
    field: 'offering',
    type: 'textarea',
    placeholder: 'Ej. Consulta inicial gratuita, paquete de tratamiento completo...',
  },
  {
    id: 11,
    question: '¿Por qué esta oferta es ahora?',
    field: 'urgencyReason',
    type: 'textarea',
    placeholder: 'Ej. Solo 10 lugares disponibles este mes, promoción válida hasta el viernes...',
  },
]
