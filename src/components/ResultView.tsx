import { useForm } from '../context/FormContext'

export function ResultView() {
  const { result, error, resetForm, isLoading } = useForm()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">Generando tu diálogo persuasivo...</p>
          <p className="text-sm text-slate-400 mt-1">Esto puede tomar unos segundos</p>
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl">
          ✅
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">¡Tu diálogo está listo!</h2>
          <p className="text-sm text-slate-500">Copia el texto y úsalo en tu contenido</p>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 relative">
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

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={resetForm}
          className="px-6 py-2.5 border-2 border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
        >
          Crear nuevo diálogo
        </button>
      </div>
    </div>
  )
}
