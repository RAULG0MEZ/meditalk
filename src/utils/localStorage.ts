import type { FormData } from '../types/form'

const STORAGE_KEY = 'meditalk_form_data'
const STORAGE_TIMESTAMP_KEY = 'meditalk_form_timestamp'

export function saveFormData(data: FormData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().toISOString())
  } catch (error) {
    console.error('Error saving form data to localStorage:', error)
  }
}

export function loadFormData(): FormData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error loading form data from localStorage:', error)
    return null
  }
}

export function getFormDataTimestamp(): string | null {
  try {
    return localStorage.getItem(STORAGE_TIMESTAMP_KEY)
  } catch (error) {
    console.error('Error loading timestamp from localStorage:', error)
    return null
  }
}

export function clearFormData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_TIMESTAMP_KEY)
  } catch (error) {
    console.error('Error clearing form data from localStorage:', error)
  }
}

export function hasCompletedData(data: FormData | null): boolean {
  if (!data) return false

  // Check if at least the essential fields are filled
  const essentialFields: (keyof FormData)[] = [
    'publicationType',
    'doctorName',
    'specialty',
    'targetAudience',
    'offering'
  ]

  return essentialFields.every(field => data[field] && data[field].trim() !== '')
}
