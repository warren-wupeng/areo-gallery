// 环境变量类型
export * from './env'

// 数据库类型
export * from './database.types'
export * from './supabase'

// 认证类型
export * from './auth'

// 通用类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 表单类型
export interface FormState {
  loading: boolean
  error: string | null
  success: boolean
}

// 文件上传类型
export interface FileUpload {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

// 搜索和过滤类型
export interface SearchParams {
  query?: string
  category?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 通知类型
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}
