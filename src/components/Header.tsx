export function Header() {
  return (
    <header className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
        <span className="text-white text-lg font-bold">M</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-800 leading-none">MediTalk</h1>
        <p className="text-xs text-slate-500">Generador de diálogos persuasivos</p>
      </div>
    </header>
  )
}
