declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase 配置
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string

      // 短信服务配置 (可选)
      SMS_API_KEY?: string
      SMS_API_SECRET?: string

      // 邮件服务配置 (可选)
      SMTP_HOST?: string
      SMTP_PORT?: string
      SMTP_USER?: string
      SMTP_PASS?: string

      // 应用配置
      NEXT_PUBLIC_APP_URL: string
      NEXTAUTH_SECRET?: string
      NEXTAUTH_URL?: string

      // Next.js 内置环境变量
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}

// 确保这个文件被当作模块处理
export {}
