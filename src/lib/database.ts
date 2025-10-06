/**
 * 简化版数据库工具函数
 * 基于 Supabase Auth 内置功能，仅支持邮箱登录
 */

import { supabase } from './supabase'
import { supabaseAdmin } from './supabase-server'
import type { Database } from '@/types/database.types'

// 类型定义
type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

type UserActivityLog = Database['public']['Tables']['user_activity_logs']['Row']
type UserActivityLogInsert = Database['public']['Tables']['user_activity_logs']['Insert']

// 用户档案相关函数

/**
 * 获取用户档案
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

/**
 * 更新用户档案
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<{
    username: string
    full_name: string
    avatar_url: string
    bio: string
    role: 'user' | 'admin'
  }>
): Promise<any> {
  const { data, error } = await (supabaseAdmin as any)
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }

  return data
}

/**
 * 创建用户档案
 */
export async function createUserProfile(
  profile: ProfileInsert
): Promise<Profile | null> {
  const { data, error } = await (supabase as any)
    .from('profiles')
    .insert(profile)
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return data
}

/**
 * 检查用户名是否可用
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (error && error.code === 'PGRST116') {
    // 没有找到记录，用户名可用
    return true
  }

  if (error) {
    console.error('Error checking username availability:', error)
    return false
  }

  return false // 找到了记录，用户名不可用
}

// 用户活动日志相关函数

// 用户活动日志功能暂时移除，因为表结构可能未完全同步
// 可以在数据库迁移完成后重新添加这些函数

// 用户状态相关函数

/**
 * 检查用户是否为管理员
 */
export async function isAdmin(userId?: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin')

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return data
}

/**
 * 获取用户角色
 */
export async function getUserRole(userId?: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_user_role')

  if (error) {
    console.error('Error getting user role:', error)
    return null
  }

  return data
}

// 用户活动日志功能暂时移除

// 管理员相关函数

/**
 * 获取用户统计信息
 */
export async function getUserStats(): Promise<Database['public']['Views']['admin_user_stats']['Row'] | null> {
  const { data, error } = await supabase
    .from('admin_user_stats')
    .select('*')
    .single()

  if (error) {
    console.error('Error getting user stats:', error)
    return null
  }

  return data
}

/**
 * 获取所有用户列表（管理员）
 */
export async function getAllUsers(
  limit: number = 50,
  offset: number = 0
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error getting all users:', error)
    return []
  }

  return data || []
}

/**
 * 获取公开用户信息
 */
export async function getPublicProfiles(
  limit: number = 50,
  offset: number = 0
): Promise<Database['public']['Views']['public_profiles']['Row'][]> {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error getting public profiles:', error)
    return []
  }

  return data || []
}

/**
 * 更新用户角色（管理员功能）
 */
export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin'
): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user role:', error)
    return false
  }

  return true
}

// 搜索相关函数

/**
 * 搜索用户
 */
export async function searchUsers(
  query: string,
  limit: number = 20
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(limit)

  if (error) {
    console.error('Error searching users:', error)
    return []
  }

  return data || []
}

/**
 * 获取用户数量统计
 */
export async function getUserCount(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error getting user count:', error)
    return 0
  }

  return count || 0
}