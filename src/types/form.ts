export type PublicationType = 'paid_ads' | 'organic' | ''

export interface FormData {
  publicationType: PublicationType
  specialty: string
  location: string
  clinicName: string
  targetAudience: string
  uniqueness: string
  uniqueMethod: string
  patientCount: string
  awardsTestimonials: string
  offering: string
  urgencyReason: string
}

export interface Step {
  id: number
  question: string
  field: keyof FormData
  type: 'radio' | 'text' | 'textarea'
  placeholder?: string
  optional?: boolean
  options?: { value: string; label: string; description?: string }[]
}
