import { type KeyboardEvent } from 'react'
import type { Step } from '../types/form'
import { useForm } from '../context/FormContext'

interface FormStepProps {
  step: Step
}

export function FormStep({ step }: FormStepProps) {
  const { formData, updateField, nextStep, prevStep, currentStep, totalSteps, submitForm, isFieldsLocked, unlockFields } =
    useForm()

  const value = formData[step.field] as string
  const isFirst = currentStep === 1
  const isLast = currentStep === totalSteps
  const canProceed = step.optional ? true : value.trim() !== ''

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && step.type !== 'textarea') {
      e.preventDefault()
      if (canProceed) isLast ? submitForm() : nextStep()
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        {isFieldsLocked && (
          <div className="mb-4 flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm font-medium text-blue-800">
                Campos bloqueados - Usando datos guardados
              </p>
            </div>
            <button
              onClick={unlockFields}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Desbloquear para editar
            </button>
          </div>
        )}
        {step.important && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 inline-block">
            Pregunta más importante — descríbela con el mayor detalle posible
          </p>
        )}
        <h2 className="text-2xl font-bold text-slate-800 leading-snug">
          {step.question}
          {step.optional && (
            <span className="ml-2 text-sm font-normal text-slate-400">(Opcional)</span>
          )}
        </h2>
      </div>

      {step.type === 'radio' && step.options && (
        <div className="flex flex-col gap-3">
          {step.options.map(opt => (
            <label
              key={opt.value}
              className={`
                flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${value === opt.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-indigo-200 bg-white'
                }
              `}
            >
              <input
                type="radio"
                name={step.field}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => updateField(step.field, opt.value)}
                disabled={isFieldsLocked}
                className="mt-1 accent-indigo-600 w-4 h-4 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div>
                <p className="font-semibold text-slate-800">{opt.label}</p>
                {opt.description && (
                  <p className="text-sm text-slate-500 mt-0.5">{opt.description}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      )}

      {step.type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={e => updateField(step.field, e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={step.placeholder}
          autoFocus
          disabled={isFieldsLocked}
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-slate-800 placeholder-slate-400 text-base transition-colors disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
        />
      )}

      {step.type === 'textarea' && (
        <textarea
          value={value}
          onChange={e => updateField(step.field, e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={step.placeholder}
          autoFocus
          rows={4}
          disabled={isFieldsLocked}
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-slate-800 placeholder-slate-400 text-base transition-colors resize-none disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
        />
      )}

      <div className="flex gap-3 pt-2">
        {!isFirst && (
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-medium hover:bg-slate-100 transition-colors"
          >
            ← Anterior
          </button>
        )}
        <button
          onClick={isLast ? submitForm : nextStep}
          disabled={!canProceed}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all
            ${canProceed
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          {isLast ? 'Generar diálogo →' : 'Continuar →'}
        </button>
      </div>

      {step.type !== 'radio' && !step.optional && value.trim() === '' && (
        <p className="text-xs text-slate-400 -mt-2">
          {step.type === 'textarea'
            ? 'Presiona Shift+Enter para nueva línea'
            : 'Presiona Enter para continuar'}
        </p>
      )}
    </div>
  )
}
