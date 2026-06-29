import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { seedAuthorizationCodes } from './services/AuthService'

// Trigger B2B authorization codes auto-seeding on app start
seedAuthorizationCodes();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
