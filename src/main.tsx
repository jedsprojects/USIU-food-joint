import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { addToast } from './utils/toast'
import App from './App.tsx'

registerSW({
  onNeedRefresh() {
    addToast('New version available — refresh to update', 'info', 'system_update')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
