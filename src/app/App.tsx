import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { Toaster } from '@/components/ui/sonner'
import { Editor } from '@/pages/editor'
import { Home } from '@/pages/home'
import { Playground } from '@/pages/playground'

import { routes } from './routes'
import { StoreProvider } from './store'

const router = createBrowserRouter([
  {
    path: routes.home,
    element: <Home />,
  },
  {
    path: routes.editor,
    element: <Editor />,
  },
  {
    path: routes.playground,
    element: <Playground />,
  },
])

export function App() {
  return (
    <StoreProvider>
      <RouterProvider router={router} />
      <Toaster />
    </StoreProvider>
  )
}
