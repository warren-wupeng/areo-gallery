'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, createBrowserSupabaseClient } from '@/lib/supabase'
import { AuthContextType, AuthState, SignUpData, SignInData, VerifyData, ProfileData, AuthResult } from '@/types/auth'
import { Profile } from '@/types/supabase'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true
  })

  useEffect(() => {
    // 获取初始会话
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // 获取用户档案
          const profile = await fetchUserProfile(session.user.id)
          setAuthState({
            user: session.user,
            profile,
            session,
            loading: false
          })
        } else {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false
          })
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false
        })
      }
    }

    getInitialSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (session?.user) {
          // 获取用户档案
          const profile = await fetchUserProfile(session.user.id)
          setAuthState({
            user: session.user,
            profile,
            session,
            loading: false
          })
        } else {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 获取用户档案
  const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // 用户注册
  const signUp = async (data: SignUpData): Promise<AuthResult> => {
    try {
      const signUpData: any = {
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.fullName
          }
        }
      }

      if (data.type === 'email') {
        signUpData.email = data.contact
      } else if (data.type === 'phone') {
        signUpData.phone = data.contact
      }

      const { data: authData, error: authError } = await supabase.auth.signUp(signUpData)

      if (authError) {
        return {
          success: false,
          error: authError.message
        }
      }

      // 如果注册成功，创建用户档案
      if (authData.user) {
        try {
          await (supabase as any)
            .from('profiles')
            .insert({
              id: authData.user.id,
              username: data.username || null,
              full_name: data.fullName || null,
              role: 'user',
              is_banned: false,
              failed_login_attempts: 0
            })
        } catch (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }

      return {
        success: true,
        data: authData,
        message: '注册成功，请检查邮箱或手机验证码'
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        success: false,
        error: '注册失败，请重试'
      }
    }
  }

  // 用户登录
  const signIn = async (data: SignInData): Promise<AuthResult> => {
    try {
      const signInData: any = {
        password: data.password
      }

      if (data.contact.includes('@')) {
        signInData.email = data.contact
      } else {
        signInData.phone = data.contact
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword(signInData)

      if (authError) {
        return {
          success: false,
          error: authError.message
        }
      }

      return {
        success: true,
        data: authData,
        message: '登录成功'
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        success: false,
        error: '登录失败，请重试'
      }
    }
  }

  // 用户登出
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // 验证码验证
  const verifyCode = async (data: VerifyData): Promise<AuthResult> => {
    try {
      const verifyData: any = {
        token: data.code,
        type: data.type === 'password_reset' ? 'recovery' : 'email'
      }

      if (data.type === 'email') {
        verifyData.email = data.contact
      } else if (data.type === 'phone') {
        verifyData.phone = data.contact
      }

      const { data: verifyResult, error: verifyError } = await supabase.auth.verifyOtp(verifyData)

      if (verifyError) {
        return {
          success: false,
          error: verifyError.message
        }
      }

      return {
        success: true,
        data: verifyResult,
        message: '验证成功'
      }
    } catch (error) {
      console.error('Verify code error:', error)
      return {
        success: false,
        error: '验证失败，请重试'
      }
    }
  }

  // 重置密码
  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password/reset`
      })

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        message: '密码重置邮件已发送'
      }
    } catch (error) {
      console.error('Reset password error:', error)
      return {
        success: false,
        error: '发送失败，请重试'
      }
    }
  }

  // 更新用户档案
  const updateProfile = async (data: ProfileData): Promise<AuthResult> => {
    try {
      if (!authState.user) {
        return {
          success: false,
          error: '用户未登录'
        }
      }

      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id)

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      // 更新本地状态
      const updatedProfile = await fetchUserProfile(authState.user.id)
      setAuthState(prev => ({
        ...prev,
        profile: updatedProfile
      }))

      return {
        success: true,
        message: '档案更新成功'
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return {
        success: false,
        error: '更新失败，请重试'
      }
    }
  }

  const value: AuthContextType = {
    user: authState.user,
    profile: authState.profile,
    session: authState.session,
    loading: authState.loading,
    signUp,
    signIn,
    signOut,
    verifyCode,
    resetPassword,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
