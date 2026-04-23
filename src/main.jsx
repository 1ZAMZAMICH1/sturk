// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'

// Убрали StrictMode, так как он вызывает двойную инициализацию Leaflet и Canvas (WebGL) на локалке,
// что приводит к ошибкам "Map container is being reused" и потере контекста GPU.
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)