import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import '@fontsource-variable/hanken-grotesk'
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster, TooltipProvider } from '../src'
import { App } from './App'
import { BrandProvider } from './lib/brand'
import { CustomizerProvider } from './lib/customizer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrandProvider>
      <CustomizerProvider>
        <TooltipProvider>
          <App />
          <Toaster />
        </TooltipProvider>
      </CustomizerProvider>
    </BrandProvider>
  </StrictMode>,
)
