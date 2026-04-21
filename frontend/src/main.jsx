import React, { useState, useCallback } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import CustomCursor from './pages/CustomCursor'
import PreloaderScreen from './components/PreloaderScreen'

function App() {
  const [preloaderDone, setPreloaderDone] = useState(false)
  const [appVisible, setAppVisible] = useState(false)

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true)
    // Slight delay so preloader fade-out overlaps the app fade-in
    setTimeout(() => setAppVisible(true), 100)
  }, [])

  return (
    <>
      {/* Preloader — unmounts after animation */}
      {!preloaderDone && (
        <PreloaderScreen onComplete={handlePreloaderComplete} />
      )}

      {/* Main App — fades in under the preloader */}
      <div
        style={{
          opacity: appVisible ? 1 : 0,
          transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
        }}
      >
        <BrowserRouter>
          <CustomCursor />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
