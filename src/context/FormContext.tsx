import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { FormData } from '../types/form'
import { saveFormData, loadFormData, clearFormData, hasCompletedData } from '../utils/localStorage'

interface FormContextType {
  formData: FormData
  savedFormData: FormData | null
  currentStep: number
  totalSteps: number
  isLoading: boolean
  loadingStep: number
  isModifying: boolean
  result: string | null
  error: string | null
  updateField: (field: keyof FormData, value: string) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  submitForm: () => Promise<void>
  modifyResult: (instruction: string) => Promise<void>
  resetForm: () => void
}

const initialFormData: FormData = {
  publicationType: '',
  title: '',
  doctorName: '',
  specialty: '',
  location: '',
  clinicName: '',
  targetAudience: '',
  uniqueness: '',
  uniqueMethod: '',
  patientCount: '',
  awardsTestimonials: '',
  offering: '',
  urgencyReason: '',
}

const FormContext = createContext<FormContextType | null>(null)

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [savedFormData, setSavedFormData] = useState<FormData | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [isModifying, setIsModifying] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const totalSteps = 13

  // Load saved data on mount — pre-populate form and keep reference for inline options
  useEffect(() => {
    const savedData = loadFormData()
    if (savedData && hasCompletedData(savedData)) {
      setFormData(savedData)
      setSavedFormData(savedData)
    }
  }, [])

  // Auto-save form data whenever it changes
  useEffect(() => {
    if (formData.publicationType) {
      saveFormData(formData)
    }
  }, [formData])

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
  }

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) setCurrentStep(step)
  }

  const submitForm = async () => {
    setIsLoading(true)
    setLoadingStep(0)
    setError(null)

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
      if (!apiKey) throw new Error('Falta la clave de API de Anthropic (VITE_ANTHROPIC_API_KEY)')

      setLoadingStep(1)
      const copy = await callAnthropic(apiKey, buildPrompt(formData))

      setLoadingStep(2)
      const withCredibility = await callAnthropic(apiKey, buildCredibilityPrompt(copy, formData.targetAudience))

      setLoadingStep(3)
      const colloquial = await callAnthropic(apiKey, buildColloquialPrompt(withCredibility))

      setLoadingStep(4)
      const formatted = await callAnthropic(apiKey, buildFormatPrompt(colloquial))

      setResult(formatted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
      setLoadingStep(0)
    }
  }

  const resetForm = () => {
    setLoadingStep(0)
    setFormData(initialFormData)
    setSavedFormData(null)
    setCurrentStep(1)
    setResult(null)
    setError(null)
    clearFormData()
  }

  const modifyResult = async (instruction: string) => {
    if (!result) return
    setIsModifying(true)
    setError(null)

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
      if (!apiKey) throw new Error('Falta la clave de API de Anthropic (VITE_ANTHROPIC_API_KEY)')

      const prompt = `Te comparto un copy ya terminado y una instrucción de modificación. Tu tarea es aplicar únicamente los cambios solicitados sin alterar el formato, la estructura, el estilo coloquial, ni el tono del resto del texto. Mantén los renglones cortos, el espaciado entre líneas y todas las reglas de formato que ya tiene el copy.

Copy actual:
${result}

Instrucción de modificación:
${instruction}

Devuelve únicamente el copy modificado, sin explicaciones adicionales.`

      const modified = await callAnthropic(apiKey, prompt)
      setResult(modified)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setIsModifying(false)
    }
  }

  return (
    <FormContext.Provider
      value={{
        formData,
        savedFormData,
        currentStep,
        totalSteps,
        isLoading,
        loadingStep,
        isModifying,
        result,
        error,
        updateField,
        nextStep,
        prevStep,
        goToStep,
        submitForm,
        modifyResult,
        resetForm,
      }}
    >
      {children}
    </FormContext.Provider>
  )
}

export function useForm() {
  const ctx = useContext(FormContext)
  if (!ctx) throw new Error('useForm must be used inside FormProvider')
  return ctx
}

async function callAnthropic(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error((errData as { error?: { message?: string } })?.error?.message || `Error ${response.status}`)
  }

  const data = await response.json() as { content: { text: string }[] }
  return data.content[0].text
}

function buildPrompt(data: FormData): string {
  const publicationLabel =
    data.publicationType === 'paid_ads' ? 'Anuncios de paga' : 'Contenido orgánico'

  const uniqueMethodLine = (() => {
    if (!data.uniqueMethod) return ''
    const isStory = data.uniqueMethod.startsWith('HISTORIA:')
    const text = data.uniqueMethod.replace(/^(MÉTODO:|HISTORIA:)\s*/, '')
    return `- ${isStory ? 'Mi historia profesional (viaje del héroe)' : 'Método o tratamiento único'}: ${text}`
  })()

  const datosAdicionalesLines = [
    data.uniqueness ? `- Lo que me hace único: ${data.uniqueness}` : '',
    uniqueMethodLine,
    data.awardsTestimonials ? `- Premios, logros y testimonios: ${data.awardsTestimonials}` : '',
  ].filter(s => s !== '')

  const datosAdicionales = datosAdicionalesLines.length > 0
    ? `Datos adicionales:\n${datosAdicionalesLines.join('\n')}`
    : ''

  const urgencyLine = data.urgencyReason
    ? `Escasez/Urgencia: ${data.urgencyReason}`
    : 'Escasez/Urgencia: No aplica, NO menciones ni inventes urgencia.'

  const urgencyPaso9 = data.urgencyReason
    ? `PASO 9. Crear Urgencia: Concluye con una invitación a actuar de inmediato usando esta escasez/urgencia real: "${data.urgencyReason}".`
    : 'PASO 9. Crear Urgencia: No hay urgencia específica; omite este paso y cierra de forma natural.'

  return `Tu trabajo será hacer un copy brutalmente alarmante y EMOCIONAL EXAGERADO PERO REAL y tu tarea es únicamente pasarme la respuesta, nada más, a continuación te compartiré las instrucciones pero quiero que recuerdes que me tienes que pasar simplemente el copy final pulido.

Objetivo General:
Tu tarea será redactar un copy con una narrativa altamente pesimista y alarmante que de consecuencias horribles al que consume este contenido sobre el tema, que destaque un problema GRANDE y REAL que es dolorosamente relatable y familiar. Este copy estará dirigido a un consumidor ideal, específicamente seleccionado para resonar con lo que ofrecemos y con los problemas que enfrentan en su vida diaria.
El objetivo es que el lector despierte y se de cuenta que tiene un problema más grande de lo que realmente pensaba que tenia, pero de la misma manera que se sienta super comprendido y muy reconocido, mientras creamos conciencia sobre ${data.targetAudience}. Al final, presentaremos ${data.offering} como la solución absoluta y unica que NO se puede comparar con anda más.
Recuerda que no buscamos desinformar ni mentir, sino ayudar genuinamente a través de generación de conciencia, contenido auténtico y extremadamente relevante. Por favor, entrega el copy final pulido, listo para publicar. A continuación, te proporcionaré la información necesaria.

Este post es ${publicationLabel}.
Datos Iniciales de ti:
Nombre completo: ${data.title} ${data.doctorName}
Especialidad: ${data.specialty}
A quién y a qué los ayudas: ${data.targetAudience}
Localidad: ${data.location}
Hospital: ${data.clinicName}
${data.patientCount ? `Total de pacientes atendidos: ${data.patientCount}` : ''}
${datosAdicionales}
Oferta: Estás ofreciendo ${data.offering}
${urgencyLine}
Eres el mejor copywriter de la historia, al nivel de maestros de noticias negativas televisivas y medios globales.
Eres un experto en crear mensajes que capturan brutalmente la atención en las redes sociales de manera ultraespecífica y persuasiva.
Tienes un profundo entendimiento de la psicología humana y sabes cómo conectar emocionalmente con el público objetivo específico.

Tu objetivo es generar copys que no solo llamen la atención, sino que también resuenen profundamente con las personas adecuadas.
Elige aleatoriamente una fórmula de copy según al que sería más adecuado para la información otorgada.

SI ALGÚN DATO NO VIENE COMPLETO DE TODOS MODOS HAZ EL COPY.

Objetivo Específico:
Escribir un copy sumamente PESIMISTA HACIA EL PROBLEMA que enganchen a las personas desde el principio explicando una brutal consecuencia que podría suceder si no saben sobre la info que estarás por revelar que así los mantengas leyendo hasta el final utilizando loops para enganchar a la audiencia.
Escribir tal cual como si hablaras, para lograr una conexión más auténtica y cercana.
Pautas Específicas:
Es OBLIGATORIO abrir el mensaje con un gancho altamente intrigante con un plot twist o que rompa el patrón de lo normal, que cause que un humano diga ¿Pero qué rayos, que me puede pasar a mi si no consumo esto? pero que esté rápidamente conectado con el tema a tratar. Esto tiene que ser extremadamente relevante para la audiencia objetivo ya que si es un título generico que simplemente intrigue por intrigar a cualquiera, entonces atraeremos a las personas incorrectas. Tienes que intrigar y dirigir la primera línea del copy a nuestra audiencia ideal.
IMPORTANTE: En el caso de mencionar una ubicación, tienes que dar una razón en el copy del porque esto es como algo peligroso, nuevo, diferente que está pasando en la ubicación, para que los lectores les genere más interés leerlo ya que sentirían que les estaría afectando directamente, pero tiene que haber congruencia, debe de tener sentido y no se debe de mentir, solo se tiene que dar una narrativa convincente, que impacta desde un ángulo no común.
NO OLVIDES PRESENTARTE: Después de abrir con el gancho, en el climax de la intriga, te presentarás y darás de forma resumida tu información y/o credenciales para que la gente tenga confianza del narrador para validar el mensaje que se está estableciendo.
Longitud: Es OBLIGATORIO que el copy tenga entre 1,000 y 1,500 palabras, pero no se trata solo de alcanzar ese número. El contenido debe estar bien estructurado, guiando al lector de manera fluida y lógica, como si estuvieras contándole una historia, informando o educando y que mantenga su interés y lo lleva de un punto a otro. La idea es que cada parte del mensaje tenga un propósito claro y conduzca al siguiente paso de forma natural, sin relleno innecesario.
90% del texto debe enfocarse en asustar, intrigar, educar con recomendaciones altamente beneficiosas, elevar conciencia del problema y la necesidad de una solución.
10% del texto (al final) se destina a ofrecer y hacer el llamado a la acción.
Escribe renglones de máximo 60 caracteres. Si necesitas continuar la idea, usa comas (,) elipses (...) y continúa en el siguiente renglón con la primera letra de la primera palabra en mayúscula, de lo contrario termina con punto (.)
La primera palabra de cada renglón tiene que empezar con mayúscula
Escribe con propósito; cada palabra debe tener una intención clara.
Cada línea debe estar separada por doble renglón para facilitar la lectura.
Prohibido usar referencias similares a los ejemplos proporcionados.
Piensa como el paciente ideal; ponte en sus zapatos para entender sus necesidades y deseos.
Utiliza para enumerar síntomas, consejos o beneficios de manera clara y organizada.
Evita el lenguaje profesional o palabras con un grado complejo de entendimiento.
Utiliza jerga que resuene con el público objetivo.
Se altamente coloquial pero no naco.
Escribe como si hablaras y utiliza expresiones coloquiales (ejemplos: Uff, híjole, tssss, caray, vaya!, qué cosa?, anda!, qué sorpresa, mira nada más, no puede ser!, qué maravilla, ah, qué bien!, qué interesante?, no me digas!, válgame Dios!, fíjate nada más, madre mía!, ándale pues, increíble!, qué curioso, vaya sorpresa!, qué detalle!, qué emoción!, quién lo diría?, esto sí que no me lo esperaba, por Dios!, qué alegría!, qué bárbaro!, en serio?, no lo puedo creer!, pero qué bien, vaya que sí!, sin palabras!, qué momento!, qué locura!, madre santa!, santo cielo!, qué impresión!, qué regalo para los ojos!, wow!, de no creerse!, tremendo!, esto me vuela la cabeza!, ah, caramba!, fíjate qué cosa!, mira tú, quién lo iba a decir?, ni en mis mejores sueños!, vaya que sí!, tsss, qué fuerte!, de película!, qué sorpresón!, oye, pues sí que la vida sorprende!, increíble, qué espectáculo!, madre mía, qué maravilla!, esto sí que no me lo veía venir!, no cabe duda!, vaya, qué dicha!).
Agrega elementos que le den validez y credibilidad al copy. Es importante que los elementos que agregues sean altamente relevantes y familiares para la audiencia meta. Prioriza referencias mainstream, de fácil reconocimiento y que formen parte de la vida cotidiana del público al que va dirigido el mensaje. Evita referencias de nicho o elementos demasiado técnicos o específicos que el público no reconocerá.
Habla en Plural de Ustedes, NUNCA de "tú".
NUNCA hables de "Nosotros", sino del "YO".
Muestra que entiendes las preocupaciones y necesidades de tus pacientes.
Motiva a la acción sin ser agresivo, destacando los beneficios de tus servicios de manera convincente. Como una invitación amigable.
Utiliza mayúsculas de manera moderada para resaltar palabras clave.
La palabra "NO" siempre tiene que ir en mayúsculas.
Cada copy debe ser única y diferente, algo que no se haya escuchado o visto antes.
Utiliza datos actuales y relevantes que resuenen con los problemas actuales.
Ten conciencia que las personas están leyendo un texto.
Si comienzas a despedirte entonces ya ve pensando en terminar el copy, no lo continues.
Está PROHIBIDO usar el signo (*) incluso si quieres hacer las letras negritas, NO lo utilices.
JAMÁS digas explicitamente "actuar" como "¡Actua ahora!", "Actuemos ya", "Es tu turno actuar" o "oferta" "Contrata ahora" ni nada que parezca que estás vendiendo o anunciandote, tu forma de ofrecer es natural, como si te diera pena vender por lo cuál NO lo haces directamente.
NO debe de parecer anuncio el copy que hagas, literalmente todo lo contrario.

MATA EL ELEFANTE DE LA HABITACIÓN: Anticipa las dudas de tu audiencia. Muchos podrían preguntarse por qué estás publicando esto o por qué has decidido compartir este contenido. Explica tus intenciones para justificar el 'por qué' del post, y así evitar escepticismo. Si es un anuncio pagado, menciona alguna razón o contexto que lo justifique. Si es contenido orgánico, esta explicación no es tan necesaria, pero aún puede ayudar.

Referencias Actuales: Incorpora temas, datos y tendencias actuales que sean de interés para el cliente, permitiéndole ver que la marca comprende y se adapta a la realidad del entorno en el que vive.

IMPORTANTE - Anclas y Asociaciones: SÍ O SÍ aprovecha elementos que despierten una conexión emocional y cognitiva inmediata en el público. Puedes recurrir a localidades conocidas, títulos de libros populares, artistas relevantes, noticias actuales, frases célebres, platillos típicos, personajes famosos, actividades comunes, hábitos diarios, aspectos de la cultura popular, estilos de música o características específicas que sean reconocibles.

Generar Familiaridad: Habla en el mismo lenguaje que tu público objetivo. Adopta un tono cercano, amigable y natural, que refleje el contexto y las experiencias de tus clientes.

Identificar el Problema Real y Profundo: No te quedes en la superficie del problema; ve más allá y busca descubrir las preocupaciones subyacentes, las emociones ocultas o los desafíos más profundos que enfrenta.

Manejo de Objeciones:
Anticipa Objeciones Comunes como "¿Por qué publicó esto esta persona?", "¿Por qué lo hace ahora?", "¿Me está mintiendo?", "¿Se quiere aprovechar de mí?".
Responde estas preguntas de forma indirecta y sútil, por ejemplo: "Hice este post para desmentir, contar, chismear, platicarles, dar mi opinión, ayudar, etc. ya que….".

EJEMPLO DE FÓRMULAS DE COPY (elige la más adecuada):

AIDA (Atención, Interés, Deseo, Acción):
PASO 1. Captar la Atención: Comienza dirigiéndose al cliente ideal con un mensaje que resuena profundamente con el problema de ${data.targetAudience}. Desde el primer renglón es obligatorio mencionar el problema y que es para personas de ${data.location}. Presenta un escenario hipotético futuro negativo que pueda pasarles.
PASO 2. Generar Interés: Atrae su curiosidad prometiendo información valiosa que se les revelará más adelante.
PASO 3. Presentar Credenciales: Haz énfasis en tu experiencia, pruebas sociales, información sobre ti y credenciales para generar autoridad y confianza.
PASO 4. Loop de gancho + Revelar la Promesa: Promete 3 consejitos, recomendaciones o métodos únicos que ayudarían con el problema de ${data.targetAudience} y cumple la promesa.
PASO 5. Educar e Inspirar: Aprovecha este espacio para educar al cliente, hacerlo reflexionar y construir confianza.
PASO 6. Crear Expectativa: Genera expectativa anunciando los 3 consejitos enfatizando que el 3ero es el más importante. Empieza a contar las primeras 2.
PASO 7. La Última Recomendación - Actuar: El consejo número 3 es lo que estás promocionando, presentándose como la solución ideal.
PASO 8. Incentivar la Oferta: Refuerza la propuesta destacando los beneficios significativos y genuinos.
${urgencyPaso9}

PAS (Problema, Agitación, Solución):
PASO 1. Identificar el Problema: Comienza dirigiéndote al cliente ideal mencionando el problema de ${data.targetAudience} y cómo afecta a personas de ${data.location}.
PASO 2. Presentar Credenciales: Haz énfasis en experiencia, pruebas sociales y credenciales.
PASO 3. Agitar el Problema: Intensifica la percepción del problema mostrando cómo puede empeorar.
PASO 4. Presentar la Solución: Introduce tu producto o servicio como la solución efectiva.

FAB (Características, Ventajas, Beneficios):
PASO 1. Presentar las Características: Describe las características específicas que abordan ${data.targetAudience}.
PASO 2. Explicar las Ventajas: Detalla cómo las características se traducen en ventajas prácticas.
PASO 3. Resaltar los Beneficios: Conecta las ventajas con beneficios concretos y emocionales.

4Ps (Problema, Promesa, Prueba, Propuesta):
PASO 1. Identificar el Problema: Menciona el problema específico de ${data.targetAudience} y cómo afecta a personas en ${data.location}.
PASO 2. Hacer una Promesa: Ofrece una promesa atractiva sobre lo que tu servicio puede lograr.
PASO 3. Proporcionar Prueba: Genera credibilidad con testimonios, casos de éxito o evidencia.
PASO 4. Hacer una Propuesta: Finaliza con una propuesta concreta invitando a tomar acción.

CTA (Llamadas a la acción):
Al momento de hacer alguna llamada de acción, muestra en lista los beneficios explícitos que obtendrá el lector.
La publicación es: ${publicationLabel}.
Recuerda: contenido orgánico es invitación al perfil, mientras que el contenido pagado es la oferta que se comentó.

En el caso de que el CTA sea para agendar citas, menciona de forma adaptada estas pautas:
PARA QUIÉN NO ES: quien solo quiera precios o comparar, quien no entienda que no hay diagnóstico por chat, quien espere atención gratis, quien busque lo más barato o soluciones rápidas, quien tenga urgencia que acuda a Urgencias.
PARA QUIÉN SÍ ES: quien tenga un problema real y quiera atenderse ya, quien esté dispuesto a agendar valoración, quien pueda cubrir honorarios y respetar horarios, quien acepte un plan personalizado.

NO seas tan insistente ni utilices palabras de venta o marketing que suban las defensas.
Es importante relatar todo de manera informal, como una invitación y no una propuesta formal.

Recuerda:
No queremos copias ni mensajes genéricos.
Tiene que ser super específico el dolor, NO puedes generalizar.
Tiene que iniciar con un rompe patrón RELEVANTE que conecte con los dolores del cliente ideal.
Escribe tal cual como habla un humano en vivo con las expresiones necesarias.`
}

function buildCredibilityPrompt(previousCopy: string, targetAudience: string): string {
  return `Te voy a compartir un texto y tu trabajo será únicamente agregar elementos al copy que le den validez real y credibilidad al espectador según su identidad o perfil, sin modificar los elementos claves que ya vienen agregados.

Es importante que los elementos que agregues sean altamente relevantes y familiares para la audiencia a la dirigida (${targetAudience}). Prioriza referencias mainstream, de fácil reconocimiento, familiaridad y que formen parte de la vida cotidiana del público al que va dirigido el mensaje (NO del narrador).

Evita referencias de nicho o elementos demasiado técnicos o específicos que el público no reconocerá. Tienes que entender el nivel de conciencia probable que tendría la audiencia y elegir los elementos que sean relevantes y familiares al contexto como de la situación.

Tipos de elementos a elegir:
Marcas de productos conocidos
Localidades conocidas
Títulos de libros populares
Artistas relevantes
Noticias actuales
Artículos o estudios relevantes
Frases célebres
Películas o series populares
Platillos de comida reconocidos
Herramientas digitales o físicas comunes
Personajes famosos o históricos
Actividades comunes o hábitos diarios (buenos o malos)
Métodos y técnicas reconocidas
Juegos o videojuegos populares
Objetos cotidianos o simbólicos
Aspectos de la cultura popular
Estilos de música conocidos
Rituales o prácticas conocidas
Eventos culturales o históricos relevantes
No modifiques la redacción, intención o narrativa original del texto. Tu tarea es identificar oportunidades específicas para anclar estos elementos y generar mayor identificación, familiaridad y confianza con el público meta.

Si el copy menciona medicinas, especificas con marcas o cuáles medicinas. Si mencionas que las dietas no funcionan, mencionas el nombre de las dietas que no funcionan. Y así sucesivamente, la intención es darle validez a la información que se comparte.

OJO: No uses referencias difíciles de otra lengua que NO sea ESPAÑOL o de otras culturas. Actualmente es LATINOAMERICANO.

Si mencionamos que existe un problema actual en la sociedad, mencionas algo sobre un artículo y su fuente (Solo si es relevante).

Según el contenido que te comparto, deberás elegir aquellos elementos que sean los más congruentes o importantes a detallar o agregar para generar validez y veracidad al lector.

No asumas que el lector es una persona sofisticada o que ya tiene conocimientos avanzados sobre el tema. Es importante elegir los elementos con sentido común, asegurándote de que sean reconocidos y generen familiaridad.

OJO: No alargues demasiado el copy porque actualmente ya está extenso.

Este es el copy completo, envíamelo con las modificaciones especificadas anteriormente:

${previousCopy}`
}

function buildColloquialPrompt(previousCopy: string): string {
  return `Te voy a compartir un texto y tu trabajo será únicamente usar un lenguaje más coloquial mexicano pero sin sonar naco o grosero pero adaptado a la identidad de la audiencia a la que vamos dirigida. Tienes que además agregar jergas o modismos que den un sentido de familiaridad al público objetivo.

Tienes prohibido modificar la redacción o la intención de la narrativa, simplemente convertirás el lenguaje en el que está narrado.

Imagínate que estás hablando con un público frente a ti entonces escribe de la misma forma como si hablaras, el mismo mensaje en su escritura tiene que transmitir por su redacción la emoción y tonalidad mediante los símbolos o la mala ortografía escrita a propósito. Utiliza expresiones coloquiales (ejemplos: Uff, híjole, tssss, caray, vaya!, qué cosa?, anda!, qué sorpresa, mira nada más, no puede ser!, qué maravilla, ah, qué bien!, qué interesante?, no me digas!, válgame Dios!, fíjate nada más, madre mía!, ándale pues, increíble!, qué curioso, vaya sorpresa!, qué detalle!, qué emoción!, quién lo diría?, esto sí que no me lo esperaba, por Dios!, qué alegría!, qué bárbaro!, en serio?, no lo puedo creer!, pero qué bien, vaya que sí!, sin palabras!, qué momento!, qué locura!, madre santa!, santo cielo!, qué impresión!, qué regalo para los ojos!, wow!, de no creerse!, tremendo!, esto me vuela la cabeza!, ah, caramba!, fíjate qué cosa!, mira tú, quién lo iba a decir?, ni en mis mejores sueños!, vaya que sí!, tsss, qué fuerte!, de película!, qué sorpresón!, oye, pues sí que la vida sorprende!, increíble, qué espectáculo!, madre mía, qué maravilla!, esto sí que no me lo veía venir!, no cabe duda!, vaya, qué dicha!).

La única grosería que podrías decir es "fregada" pero no te pido que la uses, solo si es que el texto lo amerita.

También tu trabajo será transmitir el mensaje con un lenguaje extremadamente sencillo, si logras detectar elementos que un joven de 12 años promedio no podría entender, entonces lo explicas de una forma que se entienda, pero solo en las partes necesarias ya que NO puedes modificar su redacción, solo aquellas frases, palabras, ideas, con dificultad media alta que el público a leída rápida no podría comprender por un alto procesamiento mental.

Este es el texto a modificar:

${previousCopy}`
}

function buildFormatPrompt(previousCopy: string): string {
  return `Te voy a proporcionar un texto, y tu tarea será corregirlo en el formato que lo deseo y devolverlo con un renglón de espacio (una línea en blanco) entre cada bloque de texto o párrafo. No escribas explicaciones ni texto adicional, solo devuelve el texto formateado.

Instrucciones específicas:

Si detectas renglones o párrafos muy largos, reescríbelos de manera más concisa o reorganízalos para que la lectura sea compacta y fluida.

Si detectas más de 2 enunciados por renglón, sepáralos: 1 enunciado, después un renglón de espacio, luego colocas el siguiente enunciado en el siguiente renglón. Con esto me refiero que si en un renglón hay un enunciado que termina tanto con (.) punto o (,), (¿?) (¡!) signos de exclamación o interrogación, lo separas al siguiente renglón con uno de espacio.

Cada renglón debe terminar forzosamente con un símbolo, ya sea elipsis (...), coma (,), o punto final (.).

Agrega un renglón de espacio (línea en blanco) entre cada bloque de texto.

Y por último, la primera letra de la primera palabra de cada renglón siempre deberá ser mayúscula.

En el caso de detectar emojis, bórralos. Y si por ejemplo hay una lista en donde usan emojis, reemplázalos por guiones (-) o números según el contexto.

De acuerdo, este es el texto a modificar, haz esas modificaciones en las partes que aplican y regresa únicamente con la respuesta:

${previousCopy}`
}
