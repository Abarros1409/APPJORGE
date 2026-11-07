import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Layout } from './components/Layout'
import { LangProvider } from './lib/i18n'
import { AuthProvider } from './lib/auth'
import { DemoInbox, RequireAuth } from './components/auth-ui'
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
const Login = lazy(() => import('./pages/Login'))
const Account = lazy(() => import('./pages/Account'))

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
      { path: '/reserva/:code', element: wrap(<RequireAuth><BookingPage /></RequireAuth>) },
      { path: '/propietarios', element: wrap(<Owners />) },
      { path: '/propietarios/publicar', element: wrap(<RequireAuth><Publish /></RequireAuth>) },
      { path: '/panel', element: wrap(<RequireAuth role="owner"><Panel /></RequireAuth>) },
      { path: '/ingresar', element: wrap(<Login />) },
      { path: '/cuenta', element: wrap(<RequireAuth><Account /></RequireAuth>) },
      { path: '/administraciones', element: wrap(<Admins />) },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/contrato/:code', element: wrap(<RequireAuth><ContractPage /></RequireAuth>) },
])

export function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <StoreProvider>
          <RouterProvider router={router} />
          <DemoInbox />
        </StoreProvider>
      </AuthProvider>
    </LangProvider>
  )
}
