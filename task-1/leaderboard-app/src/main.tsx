import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css"
import "./styles/fluent9-tokens.css"
import "./styles/fluent-app-shell.css"
import "./styles/sharepoint-themplate.css"
import "./styles/fluent-tokens.css"
import "./leaderboard.css"
import App from "./App.tsx"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
