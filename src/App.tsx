import { useState } from 'react'
import { FormProvider, useForm } from './context/FormContext'
import { STEPS } from './data/steps'
import { ProgressBar } from './components/ProgressBar'
import { StepIndicator } from './components/StepIndicator'
import { FormStep } from './components/FormStep'
import { ResultView } from './components/ResultView'
import { Header } from './components/Header'
import { LandingPage } from './components/LandingPage'
import { LibraryPage } from './components/LibraryPage'
import type { SavedDialogue } from './utils/dialogueStorage'

type AppView = 'landing' | 'form' | 'library'

interface FormContentProps {
  onGoToLibrary: () => void
  onGoHome: () => void
}

function FormContent({ onGoToLibrary, onGoHome }: FormContentProps) {
  const { currentStep, totalSteps, result, isLoading, error } = useForm()
  const showResult = result !== null || isLoading || error !== null
  const currentStepData = STEPS[currentStep - 1]

  return (
    <div className="py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Header onGoHome={onGoHome} />

        <div className="flex gap-8 items-start">
          {!showResult && <StepIndicator />}

          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            {showResult ? (
              <ResultView onGoToLibrary={onGoToLibrary} />
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

function AppContent() {
  const [view, setView] = useState<AppView>('landing')
  const { loadSavedDialogue, resetForm } = useForm()

  const handleOpenDialogue = (dialogue: SavedDialogue) => {
    loadSavedDialogue(dialogue.formData, dialogue.result, dialogue.id)
    setView('form')
  }

  const handleCreateNew = () => {
    resetForm()
    setView('form')
  }

  return (
    <>
      {view === 'landing' && (
        <LandingPage
          onCreateNew={handleCreateNew}
          onOpenLibrary={() => setView('library')}
        />
      )}
      {view === 'form' && (
        <FormContent
          onGoToLibrary={() => setView('library')}
          onGoHome={() => setView('landing')}
        />
      )}
      {view === 'library' && (
        <LibraryPage
          onCreateNew={handleCreateNew}
          onOpenDialogue={handleOpenDialogue}
          onGoHome={() => setView('landing')}
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <FormProvider>
      <AppContent />
    </FormProvider>
  )
}
