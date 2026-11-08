import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RegionProvider } from './RegionContext.jsx'
import { FeedbackProvider } from './components/FeedbackProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FeedbackProvider>
      <RegionProvider>
        <App />
      </RegionProvider>
    </FeedbackProvider>
  </StrictMode>,
)
