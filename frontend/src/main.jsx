import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router'
import { Toaster } from 'react-hot-toast'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthProvider from './providers/AuthProvider.jsx'


const queryClient = new QueryClient()

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
            <Toaster position="top-right" />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
)


/**
 * wrapping the entire app with AuthProvider to ensure that the axiosInstance is properly configured with the auth token for all requests
 * This is crucial for maintaining authenticated sessions and secure communication with the backend.
 */
