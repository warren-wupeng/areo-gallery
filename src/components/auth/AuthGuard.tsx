'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  fallback = <div>Loading...</div>,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { isAuthenticated, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, loading, router, redirectTo])

  if (loading) {
    return <>{fallback}</>
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
