import { useAuth as useAuthContext } from '@/contexts/AuthContext'

// 重新导出认证Hook
export { useAuthContext as useAuth }

// 用户信息Hook
export function useUser() {
  const { user, profile, loading } = useAuthContext()
  
  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isBanned: profile?.is_banned || false
  }
}

// 会话状态Hook
export function useSession() {
  const { session, loading } = useAuthContext()
  
  return {
    session,
    loading,
    isAuthenticated: !!session,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    userPhone: session?.user?.phone
  }
}
