import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { CaseListPage } from './pages/CaseListPage'
import { CaseDetailPage } from './pages/CaseDetailPage'
import { OrderFormPage } from './pages/OrderFormPage'

function App() {
  return (
    <BrowserRouter basename="/hacchu-tracker">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CaseListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/:caseId"
            element={
              <ProtectedRoute>
                <CaseDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/:caseId/orders/new"
            element={
              <ProtectedRoute>
                <OrderFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/:caseId/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderFormPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
