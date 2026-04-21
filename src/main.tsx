import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

window.onerror = (msg, src, line, col, err) => {
  document.body.innerHTML = `<pre style="color:red;padding:2rem;white-space:pre-wrap">JS Error: ${msg}\n${src}:${line}:${col}\n${err?.stack ?? ''}</pre>`
}

window.onunhandledrejection = (e) => {
  document.body.innerHTML = `<pre style="color:red;padding:2rem;white-space:pre-wrap">Unhandled Promise: ${e.reason}</pre>`
}

const root = document.getElementById('root')

if (!root) {
  document.body.innerHTML = '<p style="color:red;padding:2rem">Error: no se encontró #root en el DOM</p>'
} else {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}
