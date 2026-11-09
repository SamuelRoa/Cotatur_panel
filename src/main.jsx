import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/sora/300.css'
import '@fontsource/sora/400.css'
import '@fontsource/sora/500.css'
import '@fontsource/sora/600.css'
import '@fontsource/sora/700.css'
import '@fontsource/sora/800.css'
import '@fontsource/fraunces/500.css'
import '@fontsource/fraunces/600.css'
import '@fontsource/fraunces/700.css'
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
