import { Database } from './database.types.js'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// 用户相关类型
export type Profile = Tables<'profiles'>
export type Image = Tables<'images'>
export type Like = Tables<'likes'>
export type Comment = Tables<'comments'>
export type Favorite = Tables<'favorites'>
export type Download = Tables<'downloads'>
export type AuditLog = Tables<'audit_logs'>

// 插入类型
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ImageInsert = Database['public']['Tables']['images']['Insert']
export type LikeInsert = Database['public']['Tables']['likes']['Insert']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']
export type FavoriteInsert = Database['public']['Tables']['favorites']['Insert']
export type DownloadInsert = Database['public']['Tables']['downloads']['Insert']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']

// 更新类型
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ImageUpdate = Database['public']['Tables']['images']['Update']
export type CommentUpdate = Database['public']['Tables']['comments']['Update']

// 枚举类型
export type UserRole = Enums<'user_role'>
export type ImageStatus = Enums<'image_status'>

// 扩展类型
export interface ImageWithProfile extends Image {
  profiles: Profile
}

export interface ImageWithStats extends Image {
  profiles: Profile
  likes_count: number
  comments_count: number
  downloads_count: number
  user_liked: boolean
  user_favorited: boolean
}

export interface ProfileWithStats extends Profile {
  images_count: number
  approved_images_count: number
  total_likes: number
  total_comments: number
}
