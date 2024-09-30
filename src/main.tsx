import { createRoot } from 'react-dom/client'

import { QueryClient, QueryClientProvider } from 'react-query'

import './global.css'

const queryClient = new QueryClient()

import { App } from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
