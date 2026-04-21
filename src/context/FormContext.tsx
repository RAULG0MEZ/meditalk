import { createContext, useContext, useState, type ReactNode } from 'react'
import type { FormData } from '../types/form'

interface FormContextType {
  formData: FormData
  currentStep: number
  totalSteps: number
  isLoading: boolean
  result: string | null
  error: string | null
  updateField: (field: keyof FormData, value: string) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  submitForm: () => Promise<void>
  resetForm: () => void
}

const initialFormData: FormData = {
  publicationType: '',
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
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const totalSteps = 11

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
    setError(null)

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
      if (!apiKey) throw new Error('Falta la clave de API de Anthropic (VITE_ANTHROPIC_API_KEY)')

      const prompt = buildPrompt(formData)

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-7',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `Error ${response.status}`)
      }

      const data = await response.json()
      setResult(data.content[0].text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setCurrentStep(1)
    setResult(null)
    setError(null)
  }

  return (
    <FormContext.Provider
      value={{
        formData,
        currentStep,
        totalSteps,
        isLoading,
        result,
        error,
        updateField,
        nextStep,
        prevStep,
        goToStep,
        submitForm,
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

function buildPrompt(data: FormData): string {
  const publicationLabel =
    data.publicationType === 'paid_ads' ? 'Anuncios de paga' : 'Contenido orgánico'

  // TODO: Reemplazar con el prompt exacto cuando el usuario lo proporcione
  return `Crea un diálogo persuasivo para un médico con la siguiente información:

- Tipo de publicación: ${publicationLabel}
- Especialidad: ${data.specialty}
- Ubicación: ${data.location}
${data.clinicName ? `- Clínica/Hospital: ${data.clinicName}` : ''}
- Audiencia objetivo y condición a tratar: ${data.targetAudience}
- Qué lo hace único: ${data.uniqueness}
- Método o tratamiento único: ${data.uniqueMethod}
- Pacientes atendidos: ${data.patientCount}
- Premios y testimonios: ${data.awardsTestimonials}
- Oferta: ${data.offering}
- Urgencia/razón de la oferta ahora: ${data.urgencyReason}

Por favor, genera un diálogo persuasivo y profesional que pueda usar este médico en su contenido.`
}
