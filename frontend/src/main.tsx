import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import { router } from './routes'

async function enableMocking() {
  if (import.meta.env.MODE !== 'mock') return
  const { worker } = await import('./mocks/browser')
  await worker.start()
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MantineProvider>
        <RouterProvider router={router} />
      </MantineProvider>
    </StrictMode>,
  )
})