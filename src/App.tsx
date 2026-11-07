import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Layout } from './components/Layout'
import { LangProvider } from './lib/i18n'
import { StoreProvider } from './lib/store'
import Home from './pages/Home'
import Results from './pages/Results'
import UnitPage from './pages/UnitPage'
import { BuildingPage, BuildingsIndex } from './pages/Buildings'
import NotFound from './pages/NotFound'

const Checkout = lazy(() => import('./pages/Checkout'))
const BookingPage = lazy(() => import('./pages/BookingPage'))
const ContractPage = lazy(() => import('./pages/ContractPage'))
const Owners = lazy(() => import('./pages/Owners'))
const Publish = lazy(() => import('./pages/Publish'))
const Panel = lazy(() => import('./pages/Panel'))
const Admins = lazy(() => import('./pages/Admins'))

const fallback = <div className="min-h-[60dvh]" aria-busy="true" />
const wrap = (el: React.ReactNode) => <Suspense fallback={fallback}>{el}</Suspense>

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/buscar', element: <Results /> },
      { path: '/edificios', element: <BuildingsIndex /> },
      { path: '/edificios/:id', element: <BuildingPage /> },
      { path: '/unidades/:id', element: <UnitPage /> },
      { path: '/reservar/:id', element: wrap(<Checkout />) },
      { path: '/reserva/:code', element: wrap(<BookingPage />) },
      { path: '/propietarios', element: wrap(<Owners />) },
      { path: '/propietarios/publicar', element: wrap(<Publish />) },
      { path: '/panel', element: wrap(<Panel />) },
      { path: '/administraciones', element: wrap(<Admins />) },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/contrato/:code', element: wrap(<ContractPage />) },
])

export function App() {
  return (
    <LangProvider>
      <StoreProvider>
        <RouterProvider router={router} />
      </StoreProvider>
    </LangProvider>
  )
}
