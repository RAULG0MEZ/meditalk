import type { FormData } from '../types/form'

const DIALOGUES_KEY = 'meditalk_dialogues'

export interface SavedDialogue {
  id: string
  createdAt: string
  title: string
  formData: FormData
  result: string
}

export function saveDialogue(formData: FormData, result: string): SavedDialogue {
  const dialogue: SavedDialogue = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    title: [formData.title, formData.doctorName, formData.specialty]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Sin título',
    formData,
    result,
  }
  const existing = loadDialogues()
  existing.unshift(dialogue)
  try {
    localStorage.setItem(DIALOGUES_KEY, JSON.stringify(existing))
  } catch {
    // Ignore storage errors
  }
  return dialogue
}

export function loadDialogues(): SavedDialogue[] {
  try {
    const data = localStorage.getItem(DIALOGUES_KEY)
    return data ? (JSON.parse(data) as SavedDialogue[]) : []
  } catch {
    return []
  }
}

export function updateDialogueResult(id: string, result: string): void {
  try {
    const dialogues = loadDialogues()
    const idx = dialogues.findIndex(d => d.id === id)
    if (idx !== -1) {
      dialogues[idx].result = result
      localStorage.setItem(DIALOGUES_KEY, JSON.stringify(dialogues))
    }
  } catch {
    // Ignore storage errors
  }
}

export function deleteDialogue(id: string): void {
  try {
    const existing = loadDialogues().filter(d => d.id !== id)
    localStorage.setItem(DIALOGUES_KEY, JSON.stringify(existing))
  } catch {
    // Ignore storage errors
  }
}
