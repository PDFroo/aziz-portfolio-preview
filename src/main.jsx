import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/cormorant-garamond'
import '@fontsource-variable/cormorant-garamond/wght-italic.css'
import '@fontsource-variable/manrope'
import 'lenis/dist/lenis.css'
import './index.css'
import App from './App.jsx'
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
