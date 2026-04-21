import { FormProvider, useForm } from './context/FormContext'
import { STEPS } from './data/steps'
import { ProgressBar } from './components/ProgressBar'
import { StepIndicator } from './components/StepIndicator'
import { FormStep } from './components/FormStep'
import { ResultView } from './components/ResultView'
import { Header } from './components/Header'
import { SavedDataModal } from './components/SavedDataModal'
import { loadFormData, getFormDataTimestamp } from './utils/localStorage'

function FormContent() {
  const {
    currentStep,
    totalSteps,
    result,
    isLoading,
    error,
    showSavedDataModal,
    useSavedData,
    startNewForm
  } = useForm()
  const showResult = result !== null || isLoading || error !== null
  const currentStepData = STEPS[currentStep - 1]

  const savedData = loadFormData()
  const timestamp = getFormDataTimestamp()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-10 px-4">
      {showSavedDataModal && savedData && timestamp && (
        <SavedDataModal
          savedData={savedData}
          timestamp={timestamp}
          onUseSavedData={useSavedData}
          onStartNew={startNewForm}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <Header />

        <div className="flex gap-8 items-start">
          {!showResult && <StepIndicator />}

          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            {showResult ? (
              <ResultView />
            ) : (
              <>
                <ProgressBar current={currentStep} total={totalSteps} />
                <div className="mt-8">
                  <FormStep step={currentStepData} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <FormProvider>
      <FormContent />
    </FormProvider>
  )
}
