import { useForm } from '../context/FormContext'
import { STEPS } from '../data/steps'

export function StepIndicator() {
  const { currentStep, formData, goToStep } = useForm()

  return (
    <div className="hidden lg:flex flex-col gap-1 w-56 shrink-0">
      {STEPS.map(step => {
        const fieldValue = formData[step.field]
        const isCompleted = fieldValue !== '' && fieldValue !== null
        const isCurrent = step.id === currentStep
        const isPast = step.id < currentStep

        return (
          <button
            key={step.id}
            onClick={() => isPast || isCurrent ? goToStep(step.id) : undefined}
            disabled={!isPast && !isCurrent}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all
              ${isCurrent ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}
              ${isPast ? 'text-slate-500 hover:bg-slate-100 cursor-pointer' : ''}
              ${!isCurrent && !isPast ? 'text-slate-300 cursor-not-allowed' : ''}
            `}
          >
            <span
              className={`
                flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0
                ${isCurrent ? 'bg-indigo-600 text-white' : ''}
                ${isPast && isCompleted ? 'bg-emerald-500 text-white' : ''}
                ${isPast && !isCompleted ? 'bg-slate-300 text-white' : ''}
                ${!isCurrent && !isPast ? 'bg-slate-200 text-slate-400' : ''}
              `}
            >
              {isPast && isCompleted ? '✓' : step.id}
            </span>
            <span className="truncate leading-tight">{step.question}</span>
          </button>
        )
      })}
    </div>
  )
}
