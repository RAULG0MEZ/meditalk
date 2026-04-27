interface HeaderProps {
  onGoHome?: () => void
}

export function Header({ onGoHome }: HeaderProps) {
  return (
    <header className="flex items-center gap-3 mb-8">
      <button
        onClick={onGoHome}
        disabled={!onGoHome}
        className="flex items-center gap-3 group disabled:cursor-default"
      >
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-700 group-disabled:group-hover:bg-indigo-600 transition-colors">
          <span className="text-white text-lg font-bold">M</span>
        </div>
        <div className="text-left">
          <h1 className="text-xl font-bold text-slate-800 leading-none group-hover:text-indigo-700 group-disabled:group-hover:text-slate-800 transition-colors">MediTalk</h1>
          <p className="text-xs text-slate-500">Generador de diálogos persuasivos</p>
        </div>
      </button>
    </header>
  )
}
