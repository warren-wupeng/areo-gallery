'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useAuth'

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AdminGuard({ 
  children, 
  fallback = <div>Loading...</div>,
  redirectTo = '/dashboard'
}: AdminGuardProps) {
  const { isAuthenticated, isAdmin, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (!isAdmin) {
        router.push(redirectTo)
      }
    }
  }, [isAuthenticated, isAdmin, loading, router, redirectTo])

  if (loading) {
    return <>{fallback}</>
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return <>{children}</>
}
