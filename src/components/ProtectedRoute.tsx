import { Navigate } from "react-router-dom"
import type { UserRole } from "@/types/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[] // Ruoli che possono accedere
  redirectTo?: string       // Dove reindirizzare se non autorizzato
}

// Simula l'autenticazione
const getCurrentUser = () => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const user = getCurrentUser()
  
  // Se non è loggato
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  // Se sono specificati ruoli e l'utente non li ha
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return <>{children}</>
}