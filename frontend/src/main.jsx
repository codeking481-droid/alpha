import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

// PWA — register service worker if available
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // optional: register /sw.js when you add it
  })
}

// Perf — log Core Web Vitals in dev
if (import.meta.env.DEV && 'performance' in window) {
  window.addEventListener('load', () => {
    const nav = performance.getEntriesByType('navigation')[0]
    if (nav) console.log(`⚡ LCP ready • DOM ${Math.round(nav.domContentLoadedEventEnd)}ms`)
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
