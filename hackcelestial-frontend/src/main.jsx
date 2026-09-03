import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BookingProvider } from './context/BookingContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import ToastStack from './components/ui/Toast.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BookingProvider>
          <ToastProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
            <ToastStack />
          </ToastProvider>
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
