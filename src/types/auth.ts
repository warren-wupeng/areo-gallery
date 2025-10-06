import { User, Session } from '@supabase/supabase-js'
import { Profile } from './supabase'

// 认证状态类型
export interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
}

// 认证上下文类型
export interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (data: SignUpData) => Promise<AuthResult>
  signIn: (data: SignInData) => Promise<AuthResult>
  signOut: () => Promise<void>
  verifyCode: (data: VerifyData) => Promise<AuthResult>
  resetPassword: (email: string) => Promise<AuthResult>
  updateProfile: (data: ProfileData) => Promise<AuthResult>
}

// 认证数据类型
export interface SignUpData {
  contact: string
  type: 'email' | 'phone'
  password: string
  username?: string
  fullName?: string
}

export interface SignInData {
  contact: string
  password: string
  remember?: boolean
}

export interface VerifyData {
  contact: string
  code: string
  type: 'email' | 'phone' | 'password_reset'
}

export interface ProfileData {
  username?: string
  fullName?: string
  bio?: string
  avatarUrl?: string
}

// 认证结果类型
export interface AuthResult {
  success: boolean
  data?: any
  error?: string
  message?: string
}

// 验证码类型
export interface VerificationCode {
  id: string
  contact_info: string
  code: string
  type: 'email' | 'phone' | 'password_reset'
  expires_at: string
  used: boolean
  created_at: string
}

// 登录尝试类型
export interface LoginAttempt {
  id: string
  contact_info: string
  ip_address: string
  success: boolean
  attempted_at: string
}

// 管理员认证类型
export interface AdminAuthData {
  password: string
}

// 密码重置类型
export interface PasswordResetData {
  contact: string
  code: string
  newPassword: string
}
