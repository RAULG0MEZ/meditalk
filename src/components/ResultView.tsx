import { useState } from 'react'
import { useForm } from '../context/FormContext'

const LOADING_STEPS = [
  '',
  'Generando el copy base...',
  'Agregando referencias y credibilidad...',
  'Adaptando al lenguaje coloquial...',
  'Aplicando formato final...',
]

interface ResultViewProps {
  onGoToLibrary: () => void
}

export function ResultView({ onGoToLibrary }: ResultViewProps) {
  const { result, error, resetForm, isLoading, loadingStep, isModifying, modifyResult, currentDialogueId } = useForm()
  const [showModal, setShowModal] = useState(false)
  const [instruction, setInstruction] = useState('')

  const handleModify = async () => {
    if (!instruction.trim()) return
    setShowModal(false)
    await modifyResult(instruction.trim())
    setInstruction('')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">
            {LOADING_STEPS[loadingStep] || 'Procesando...'}
          </p>
          <p className="text-sm text-slate-400 mt-1">Paso {loadingStep} de 4</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              className={`h-2 w-10 rounded-full transition-colors duration-300 ${
                step < loadingStep
                  ? 'bg-indigo-600'
                  : step === loadingStep
                    ? 'bg-indigo-400 animate-pulse'
                    : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl">
          ⚠️
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Ocurrió un error</h2>
          <p className="text-slate-500 max-w-md">{error}</p>
        </div>
        <button
          onClick={resetForm}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    )
  }

  if (!result) return null

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl">
              ✅
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">¡Tu copy está listo!</h2>
              <p className="text-sm text-slate-500">
                {currentDialogueId
                  ? 'Guardado en biblioteca'
                  : 'Copia el texto y úsalo en tu contenido'}
              </p>
            </div>
          </div>
          <button
            onClick={onGoToLibrary}
            className="flex items-center gap-2 px-4 py-2 border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-xl text-sm font-medium transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Biblioteca
          </button>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 relative">
          {isModifying && (
            <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-600">Aplicando cambios...</p>
              </div>
            </div>
          )}
          <pre className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed font-sans">
            {result}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(result)}
            className="absolute top-4 right-4 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
          >
            Copiar
          </button>
        </div>
      </div>

      {/* Botones flotantes */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-20">
        <button
          onClick={() => setShowModal(true)}
          disabled={isModifying}
          title="Modificar copy"
          className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-lg flex items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={resetForm}
          disabled={isModifying}
          title="Empezar de nuevo"
          className="w-14 h-14 rounded-full bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-600 border-2 border-slate-200 shadow-lg flex items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Modal de modificación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800">¿Qué te gustaría modificar?</h3>
            <p className="text-sm text-slate-500">Describe los cambios que quieres aplicar al copy. El formato y la estructura se mantendrán.</p>
            <textarea
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              placeholder="Ej. Cambia el tono para que sea más urgente al final, o agrega más énfasis en la oferta..."
              rows={4}
              className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:border-indigo-400"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowModal(false); setInstruction('') }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleModify}
                disabled={!instruction.trim()}
                className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                Aplicar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
