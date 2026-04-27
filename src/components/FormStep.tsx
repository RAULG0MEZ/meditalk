import { useState, useEffect, type KeyboardEvent } from 'react'
import type { Step } from '../types/form'
import { useForm } from '../context/FormContext'

interface FormStepProps {
  step: Step
}

export function FormStep({ step }: FormStepProps) {
  const { formData, savedFormData, updateField, nextStep, prevStep, currentStep, totalSteps, submitForm } =
    useForm()

  const value = formData[step.field] as string
  const savedValue = (savedFormData?.[step.field] as string) ?? ''
  const isFirst = currentStep === 1
  const isLast = currentStep === totalSteps

  const [yesNoChoice, setYesNoChoice] = useState<'si' | 'no' | null>(
    step.type === 'yesno' && value.trim() !== '' ? 'si' : null
  )

  const [methodStoryChoice, setMethodStoryChoice] = useState<'method' | 'story' | 'no' | null>(
    step.type === 'method-story'
      ? value.startsWith('MÉTODO:') ? 'method'
        : value.startsWith('HISTORIA:') ? 'story'
        : null
      : null
  )

  useEffect(() => {
    if (step.type === 'yesno') {
      setYesNoChoice(value.trim() !== '' ? 'si' : null)
    }
    if (step.type === 'method-story') {
      setMethodStoryChoice(
        value.startsWith('MÉTODO:') ? 'method'
          : value.startsWith('HISTORIA:') ? 'story'
          : null
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id])

  const methodStoryText = value.startsWith('MÉTODO:')
    ? value.slice('MÉTODO:'.length).trimStart()
    : value.startsWith('HISTORIA:')
    ? value.slice('HISTORIA:'.length).trimStart()
    : value

  const canProceed = step.type === 'yesno'
    ? (yesNoChoice === 'no' || (yesNoChoice === 'si' && value.trim() !== ''))
    : step.type === 'method-story'
    ? (methodStoryChoice === 'no' || (methodStoryChoice !== null && methodStoryText.trim() !== ''))
    : step.optional ? true : value.trim() !== ''

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && step.type !== 'textarea' && step.type !== 'yesno') {
      e.preventDefault()
      if (canProceed) isLast ? submitForm() : nextStep()
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        {step.important && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 inline-block">
            Pregunta más importante — descríbela con el mayor detalle posible
          </p>
        )}
        <h2 className="text-2xl font-bold text-slate-800 leading-snug">
          {step.question}
          {step.optional && step.type !== 'yesno' && (
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
                className="mt-1 accent-indigo-600 w-4 h-4 shrink-0"
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
        <div className="flex flex-col gap-3">
          {savedValue && (
            <label
              className={`
                flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${value === savedValue
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-indigo-200 bg-white'
                }
              `}
            >
              <input
                type="radio"
                name={step.field}
                checked={value === savedValue}
                onChange={() => updateField(step.field, savedValue)}
                className="mt-1 accent-indigo-600 w-4 h-4 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-0.5">Respuesta guardada</p>
                <p className="text-sm text-slate-700 break-words">{savedValue}</p>
              </div>
            </label>
          )}
          {savedValue && (
            <p className="text-xs text-slate-500 font-medium">O escribe uno nuevo:</p>
          )}
          <input
            type="text"
            value={value === savedValue ? '' : value}
            onChange={e => updateField(step.field, e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={step.placeholder}
            autoFocus={!savedValue}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-slate-800 placeholder-slate-400 text-base transition-colors"
          />
        </div>
      )}

      {step.type === 'textarea' && (
        <div className="flex flex-col gap-3">
          {savedValue && (
            <label
              className={`
                flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${value === savedValue
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-indigo-200 bg-white'
                }
              `}
            >
              <input
                type="radio"
                name={step.field}
                checked={value === savedValue}
                onChange={() => updateField(step.field, savedValue)}
                className="mt-1 accent-indigo-600 w-4 h-4 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-0.5">Respuesta guardada</p>
                <p className="text-sm text-slate-700 break-words whitespace-pre-wrap">{savedValue}</p>
              </div>
            </label>
          )}
          {savedValue && (
            <p className="text-xs text-slate-500 font-medium">O escribe uno nuevo:</p>
          )}
          <textarea
            value={value === savedValue ? '' : value}
            onChange={e => updateField(step.field, e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={step.placeholder}
            autoFocus={!savedValue}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-slate-800 placeholder-slate-400 text-base transition-colors resize-none"
          />
        </div>
      )}

      {step.type === 'yesno' && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <label
              className={`
                flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all flex-1
                ${yesNoChoice === 'si'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-indigo-200 bg-white'
                }
              `}
            >
              <input
                type="radio"
                name={`${step.field}_yesno`}
                checked={yesNoChoice === 'si'}
                onChange={() => setYesNoChoice('si')}
                className="accent-indigo-600 w-4 h-4"
              />
              <span className="font-semibold text-slate-800">Sí</span>
            </label>
            <label
              className={`
                flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all flex-1
                ${yesNoChoice === 'no'
                  ? 'border-slate-400 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                }
              `}
            >
              <input
                type="radio"
                name={`${step.field}_yesno`}
                checked={yesNoChoice === 'no'}
                onChange={() => { setYesNoChoice('no'); updateField(step.field, '') }}
                className="accent-slate-500 w-4 h-4"
              />
              <span className="font-semibold text-slate-800">No</span>
            </label>
          </div>
          {yesNoChoice === 'si' && (
            <textarea
              value={value}
              onChange={e => updateField(step.field, e.target.value)}
              placeholder={step.placeholder}
              autoFocus
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-slate-800 placeholder-slate-400 text-base transition-colors resize-none"
            />
          )}
        </div>
      )}

      {step.type === 'method-story' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <label
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                methodStoryChoice === 'method'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-indigo-200 bg-white'
              }`}
            >
              <input
                type="radio"
                name={`${step.field}_choice`}
                checked={methodStoryChoice === 'method'}
                onChange={() => {
                  if (methodStoryChoice !== 'method') updateField(step.field, '')
                  setMethodStoryChoice('method')
                }}
                className="mt-1 accent-indigo-600 w-4 h-4 shrink-0"
              />
              <div>
                <p className="font-semibold text-slate-800">Sí, tengo un método o tratamiento único</p>
                <p className="text-sm text-slate-500 mt-0.5">Describe tu enfoque propio para destacar tu propuesta de valor</p>
              </div>
            </label>
            <label
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                methodStoryChoice === 'story'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-indigo-200 bg-white'
              }`}
            >
              <input
                type="radio"
                name={`${step.field}_choice`}
                checked={methodStoryChoice === 'story'}
                onChange={() => {
                  if (methodStoryChoice !== 'story') updateField(step.field, '')
                  setMethodStoryChoice('story')
                }}
                className="mt-1 accent-indigo-600 w-4 h-4 shrink-0"
              />
              <div>
                <p className="font-semibold text-slate-800">Quiero contar mi historia (Viaje del Héroe)</p>
                <p className="text-sm text-slate-500 mt-0.5">El recorrido que te llevó a ser quien eres hoy</p>
              </div>
            </label>
            <label
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                methodStoryChoice === 'no'
                  ? 'border-slate-400 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name={`${step.field}_choice`}
                checked={methodStoryChoice === 'no'}
                onChange={() => { setMethodStoryChoice('no'); updateField(step.field, '') }}
                className="accent-slate-500 w-4 h-4"
              />
              <span className="font-semibold text-slate-800">No</span>
            </label>
          </div>
          {(methodStoryChoice === 'method' || methodStoryChoice === 'story') && (
            <textarea
              value={methodStoryText}
              onChange={e =>
                updateField(
                  step.field,
                  (methodStoryChoice === 'method' ? 'MÉTODO: ' : 'HISTORIA: ') + e.target.value
                )
              }
              placeholder={
                methodStoryChoice === 'method'
                  ? step.placeholder
                  : 'Ej. Después de sufrir yo mismo de [condición], entendí que los tratamientos convencionales no bastaban. Estudié durante años, llegué a un punto de quiebre cuando... y hoy ayudo a mis pacientes desde esa experiencia real.'
              }
              autoFocus
              rows={5}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-slate-800 placeholder-slate-400 text-base transition-colors resize-none"
            />
          )}
        </div>
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
          {isLast ? 'Crear mi publicación →' : 'Continuar →'}
        </button>
        {step.optional && step.type !== 'yesno' && step.type !== 'method-story' && !isLast && (
          <button
            onClick={() => { updateField(step.field, ''); nextStep() }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-400 font-medium hover:bg-slate-50 hover:text-slate-500 transition-colors"
          >
            Saltar
          </button>
        )}
      </div>

      {step.type !== 'radio' && step.type !== 'yesno' && step.type !== 'method-story' && !step.optional && value.trim() === '' && (
        <p className="text-xs text-slate-400 -mt-2">
          {step.type === 'textarea'
            ? 'Presiona Shift+Enter para nueva línea'
            : 'Presiona Enter para continuar'}
        </p>
      )}
    </div>
  )
}
