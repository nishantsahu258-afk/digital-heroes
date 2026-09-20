import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'user' | 'admin'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // If they need admin but are a user, redirect to user dashboard
    if (requiredRole === 'admin') {
      return <Navigate to="/dashboard" replace />
    }
    // If they need user but are somehow not, redirect home (shouldn't happen with our roles)
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
