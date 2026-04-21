import { useState } from 'react'
import type { FormData } from '../types/form'

interface SavedDataModalProps {
  savedData: FormData
  timestamp: string
  onUseSavedData: () => void
  onStartNew: () => void
}

export function SavedDataModal({ savedData, timestamp, onUseSavedData, onStartNew }: SavedDataModalProps) {
  const [selectedOption, setSelectedOption] = useState<'saved' | 'new' | null>(null)

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleConfirm = () => {
    if (selectedOption === 'saved') {
      onUseSavedData()
    } else if (selectedOption === 'new') {
      onStartNew()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Datos guardados encontrados
          </h2>
          <p className="text-slate-600">
            Última actualización: {formatDate(timestamp)}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {/* Opción: Usar datos guardados */}
          <label
            className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${
              selectedOption === 'saved'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="dataOption"
              value="saved"
              checked={selectedOption === 'saved'}
              onChange={() => setSelectedOption('saved')}
              className="mt-1 w-5 h-5 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="ml-4 flex-1">
              <div className="font-semibold text-slate-800 mb-1">
                Usar mis datos guardados
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Cargar la información anterior y continuar desde donde lo dejé
              </p>
              <div className="bg-white p-3 rounded-lg text-xs text-slate-700 space-y-1 border border-slate-200">
                <div><strong>Doctor(a):</strong> {savedData.title} {savedData.doctorName}</div>
                <div><strong>Especialidad:</strong> {savedData.specialty || 'No especificado'}</div>
                <div><strong>Ubicación:</strong> {savedData.location || 'No especificado'}</div>
              </div>
            </div>
          </label>

          {/* Opción: Nuevo formulario */}
          <label
            className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${
              selectedOption === 'new'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="dataOption"
              value="new"
              checked={selectedOption === 'new'}
              onChange={() => setSelectedOption('new')}
              className="mt-1 w-5 h-5 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="ml-4 flex-1">
              <div className="font-semibold text-slate-800 mb-1">
                Llenar un formulario nuevo
              </div>
              <p className="text-sm text-slate-600">
                Empezar desde cero con información nueva (se borrarán los datos guardados)
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedOption}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
            selectedOption
              ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
