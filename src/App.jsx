import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Groceries from './pages/Groceries'
import Calendar from './pages/Calendar'
import Interests from './pages/Interests'
import Apartment from './pages/Apartment'
import Settings from './pages/Settings'
import More from './pages/More'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="animate-spin" style={{
        width: 36, height: 36, border: '3px solid var(--secondary)',
        borderTopColor: 'var(--primary)', borderRadius: '50%'
      }} />
    </div>
  )
  return session ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="groceries" element={<Groceries />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="interests" element={<Interests />} />
        <Route path="apartment" element={<Apartment />} />
        <Route path="settings" element={<Settings />} />
        <Route path="more" element={<More />} />
      </Route>
    </Routes>
  )
}
