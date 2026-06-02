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
import Landing from './pages/Landing'
import AmbientBackground from './components/AmbientBackground'
import LiquidFilterDef from './components/LiquidFilterDef'

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
  return session ? children : <Navigate to="/welcome" replace />
}

export default function App() {
  return (
    <>
      <AmbientBackground />
      <LiquidFilterDef />
      <Routes>
        <Route path="/welcome" element={<Landing />} />
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
    </>
  )
}
