import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const EMBED_CSP = "frame-ancestors 'self' raulgomez.com.mx *.raulgomez.com.mx gohighlevel.com *.gohighlevel.com";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/meditalk/',
  server: {
    headers: { 'Content-Security-Policy': EMBED_CSP },
  },
  preview: {
    headers: { 'Content-Security-Policy': EMBED_CSP },
  },
})
