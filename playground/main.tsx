import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, Toaster, TooltipProvider } from '../src'
import { App } from './App'
import { CustomizerProvider } from './lib/customizer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="momi-playground-theme">
      <CustomizerProvider>
        <TooltipProvider>
          <App />
          <Toaster />
        </TooltipProvider>
      </CustomizerProvider>
    </ThemeProvider>
  </StrictMode>,
)
