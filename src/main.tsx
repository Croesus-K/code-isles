import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/fusion-pixel-12px-proportional-sc'
import './styles/pixel.css'
import App from './App'
import { registerServiceWorker } from './core/serviceWorker'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

registerServiceWorker()
