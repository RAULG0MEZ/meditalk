import { useEffect, useState } from 'react'
import { loadDialogues } from '../utils/dialogueStorage'

interface LandingPageProps {
  onCreateNew: () => void
  onOpenLibrary: () => void
}

export function LandingPage({ onCreateNew, onOpenLibrary }: LandingPageProps) {
  const [dialogueCount, setDialogueCount] = useState(0)

  useEffect(() => {
    setDialogueCount(loadDialogues().length)
  }, [])

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg flex flex-col items-center gap-10">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">M</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 leading-none">MediTalk</h1>
            <p className="text-sm text-slate-500 mt-1">Crea tu publicación para redes sociales</p>
          </div>
        </div>

        {/* Cards */}
        <div className="w-full flex flex-col gap-4">
          <button
            onClick={onCreateNew}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl p-6 text-left transition-all shadow-sm hover:shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">Crear nueva publicación</p>
                <p className="text-indigo-200 text-sm mt-0.5">Contesta unas preguntas y te generamos tu texto</p>
              </div>
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:bg-indigo-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </button>

          <button
            onClick={onOpenLibrary}
            className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 rounded-2xl p-6 text-left border-2 border-slate-200 hover:border-indigo-200 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">Mis publicaciones</p>
                <p className="text-slate-400 text-sm mt-0.5">
                  {dialogueCount === 0
                    ? 'Aún no tienes publicaciones guardadas'
                    : `${dialogueCount} ${dialogueCount === 1 ? 'publicación guardada' : 'publicaciones guardadas'}`}
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                {dialogueCount > 0 && (
                  <span className="text-xs font-bold text-indigo-600 absolute translate-x-3 -translate-y-3 bg-indigo-100 rounded-full w-5 h-5 flex items-center justify-center">
                    {dialogueCount > 99 ? '99+' : dialogueCount}
                  </span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
