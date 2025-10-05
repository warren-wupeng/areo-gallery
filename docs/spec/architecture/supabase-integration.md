# Supabase集成实施指南

## 概述

本文档详细说明如何在航空摄影图库项目中实施Supabase集成，包括具体的配置步骤、代码示例和最佳实践。

## 1. 项目初始化配置

### 1.1 环境变量配置

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 1.2 依赖安装

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @supabase/auth-helpers-react
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

### 1.3 Supabase客户端配置

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 服务端客户端（用于API路由）
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

## 2. 数据库Schema设计

### 2.1 完整数据库结构

```sql
-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户配置文件表
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 图片表
CREATE TABLE public.images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  aircraft_registration TEXT NOT NULL,
  airline TEXT NOT NULL,
  airport TEXT NOT NULL,
  camera_model TEXT NOT NULL,
  aircraft_model TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  exif_data JSONB,
  is_hot BOOLEAN DEFAULT FALSE,
  hot_reason TEXT,
  admin_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 点赞表
CREATE TABLE public.likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, image_id)
);

-- 评论表
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 收藏表
CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, image_id)
);

-- 下载记录表
CREATE TABLE public.downloads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 审核日志表
CREATE TABLE public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 索引优化

```sql
-- 性能优化索引
CREATE INDEX idx_images_status ON public.images(status);
CREATE INDEX idx_images_user_id ON public.images(user_id);
CREATE INDEX idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX idx_images_aircraft_registration ON public.images(aircraft_registration);
CREATE INDEX idx_images_airline ON public.images(airline);
CREATE INDEX idx_images_airport ON public.images(airport);

CREATE INDEX idx_likes_image_id ON public.likes(image_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);

CREATE INDEX idx_comments_image_id ON public.comments(image_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);

CREATE INDEX idx_downloads_image_id ON public.downloads(image_id);
CREATE INDEX idx_downloads_user_id ON public.downloads(user_id);
```

### 2.3 Row Level Security (RLS) 策略

```sql
-- 启用RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 用户配置文件策略
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 图片策略
CREATE POLICY "Approved images are viewable by everyone" ON public.images
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own images" ON public.images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images" ON public.images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending images" ON public.images
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- 管理员策略
CREATE POLICY "Admins can manage all images" ON public.images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 点赞策略
CREATE POLICY "Users can view all likes" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert likes" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- 评论策略
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);
```

## 3. 认证系统集成

### 3.1 认证上下文提供者

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
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
```

### 3.2 认证中间件

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 保护需要认证的路由
  if (req.nextUrl.pathname.startsWith('/upload') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (req.nextUrl.pathname.startsWith('/profile') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (req.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/upload/:path*', '/profile/:path*', '/admin/:path*']
}
```

## 4. 图片存储集成

### 4.1 存储桶配置

```sql
-- 创建存储桶
INSERT INTO storage.buckets (id, name, public) VALUES 
('aircraft-images', 'aircraft-images', true),
('user-avatars', 'user-avatars', true);

-- 存储桶策略
CREATE POLICY "Public images are viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'aircraft-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'aircraft-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'aircraft-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 4.2 图片上传服务

```typescript
// services/imageUpload.ts
import { supabase } from '@/lib/supabase'

export interface ImageUploadData {
  file: File
  title: string
  aircraftRegistration: string
  airline: string
  airport: string
  cameraModel: string
  aircraftModel: string
  isHot?: boolean
  hotReason?: string
  adminNotes?: string
}

export async function uploadImage(data: ImageUploadData, userId: string) {
  try {
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/raw']
    if (!allowedTypes.includes(data.file.type)) {
      throw new Error('不支持的文件格式')
    }

    // 验证文件大小 (50MB限制)
    if (data.file.size > 50 * 1024 * 1024) {
      throw new Error('文件大小不能超过50MB')
    }

    // 生成唯一文件名
    const fileExt = data.file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // 上传文件到存储桶
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('aircraft-images')
      .upload(fileName, data.file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    // 获取文件URL
    const { data: urlData } = supabase.storage
      .from('aircraft-images')
      .getPublicUrl(fileName)

    // 保存图片信息到数据库
    const { data: imageData, error: dbError } = await supabase
      .from('images')
      .insert({
        user_id: userId,
        title: data.title,
        aircraft_registration: data.aircraftRegistration,
        airline: data.airline,
        airport: data.airport,
        camera_model: data.cameraModel,
        aircraft_model: data.aircraftModel,
        file_path: fileName,
        file_size: data.file.size,
        mime_type: data.file.type,
        is_hot: data.isHot || false,
        hot_reason: data.hotReason,
        admin_notes: data.adminNotes,
        status: 'pending'
      })
      .select()
      .single()

    if (dbError) throw dbError

    return { success: true, data: imageData }
  } catch (error) {
    console.error('图片上传失败:', error)
    return { success: false, error: error.message }
  }
}
```

## 5. 实时功能集成

### 5.1 实时数据订阅

```typescript
// hooks/useRealtimeImages.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Image } from '@/types'

export function useRealtimeImages() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初始加载
    fetchImages()

    // 订阅实时更新
    const subscription = supabase
      .channel('images')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'images',
          filter: 'status=eq.approved'
        },
        (payload) => {
          setImages(prev => [payload.new as Image, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'images'
        },
        (payload) => {
          setImages(prev => 
            prev.map(img => 
              img.id === payload.new.id ? payload.new as Image : img
            )
          )
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select(`
          *,
          profiles:user_id(username, avatar_url),
          likes(count),
          comments(count)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error('获取图片失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return { images, loading, refetch: fetchImages }
}
```

### 5.2 实时点赞功能

```typescript
// hooks/useRealtimeLikes.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeLikes(imageId: string) {
  const [likes, setLikes] = useState<any[]>([])
  const [likeCount, setLikeCount] = useState(0)
  const [userLiked, setUserLiked] = useState(false)

  useEffect(() => {
    fetchLikes()

    // 订阅点赞实时更新
    const subscription = supabase
      .channel(`likes-${imageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `image_id=eq.${imageId}`
        },
        () => {
          fetchLikes()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [imageId])

  const fetchLikes = async () => {
    try {
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('*, profiles:user_id(username)')
        .eq('image_id', imageId)

      if (likesError) throw likesError

      const { data: { user } } = await supabase.auth.getUser()
      
      setLikes(likesData || [])
      setLikeCount(likesData?.length || 0)
      setUserLiked(likesData?.some(like => like.user_id === user?.id) || false)
    } catch (error) {
      console.error('获取点赞失败:', error)
    }
  }

  const toggleLike = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('请先登录')

      if (userLiked) {
        // 取消点赞
        await supabase
          .from('likes')
          .delete()
          .eq('image_id', imageId)
          .eq('user_id', user.id)
      } else {
        // 添加点赞
        await supabase
          .from('likes')
          .insert({
            image_id: imageId,
            user_id: user.id
          })
      }
    } catch (error) {
      console.error('点赞操作失败:', error)
    }
  }

  return { likes, likeCount, userLiked, toggleLike }
}
```

## 6. 管理员功能集成

### 6.1 管理员认证

```typescript
// services/adminAuth.ts
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = '9814630527123456'

export async function verifyAdminAccess(inputPassword: string): Promise<boolean> {
  return inputPassword === ADMIN_PASSWORD
}

export async function grantAdminRole(userId: string) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('授予管理员权限失败:', error)
    return { success: false, error: error.message }
  }
}
```

### 6.2 图片审核功能

```typescript
// services/imageReview.ts
import { supabase } from '@/lib/supabase'

export interface ReviewAction {
  imageId: string
  action: 'approve' | 'reject'
  reason?: string
  adminId: string
}

export async function reviewImage({ imageId, action, reason, adminId }: ReviewAction) {
  try {
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      approved_by: adminId,
      approved_at: new Date().toISOString()
    }

    if (action === 'reject' && reason) {
      updateData.rejection_reason = reason
    }

    // 更新图片状态
    const { data, error } = await supabase
      .from('images')
      .update(updateData)
      .eq('id', imageId)
      .select()
      .single()

    if (error) throw error

    // 记录审核日志
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: adminId,
        action: action,
        target_type: 'image',
        target_id: imageId,
        details: { reason }
      })

    return { success: true, data }
  } catch (error) {
    console.error('审核操作失败:', error)
    return { success: false, error: error.message }
  }
}

export async function getPendingImages() {
  try {
    const { data, error } = await supabase
      .from('images')
      .select(`
        *,
        profiles:user_id(username, avatar_url)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('获取待审核图片失败:', error)
    return { success: false, error: error.message }
  }
}
```

## 7. 性能优化配置

### 7.1 数据库函数优化

```sql
-- 获取用户统计数据的函数
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'approved_count', (
      SELECT COUNT(*) FROM images 
      WHERE user_id = user_uuid AND status = 'approved'
    ),
    'rejected_count', (
      SELECT COUNT(*) FROM images 
      WHERE user_id = user_uuid AND status = 'rejected'
    ),
    'pending_count', (
      SELECT COUNT(*) FROM images 
      WHERE user_id = user_uuid AND status = 'pending'
    ),
    'total_likes', (
      SELECT COALESCE(SUM(like_count), 0) FROM (
        SELECT COUNT(*) as like_count
        FROM likes l
        JOIN images i ON l.image_id = i.id
        WHERE i.user_id = user_uuid
      ) sub
    ),
    'total_comments', (
      SELECT COUNT(*) FROM comments c
      JOIN images i ON c.image_id = i.id
      WHERE i.user_id = user_uuid
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取平台统计数据的函数
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_images', (SELECT COUNT(*) FROM images WHERE status = 'approved'),
    'total_users', (SELECT COUNT(*) FROM profiles),
    'today_uploads', (
      SELECT COUNT(*) FROM images 
      WHERE created_at >= CURRENT_DATE
    ),
    'today_approvals', (
      SELECT COUNT(*) FROM images 
      WHERE status = 'approved' AND approved_at >= CURRENT_DATE
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 7.2 缓存策略

```typescript
// utils/cache.ts
import { supabase } from '@/lib/supabase'

const CACHE_DURATION = 5 * 60 * 1000 // 5分钟
const cache = new Map<string, { data: any; timestamp: number }>()

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_DURATION
): Promise<T> {
  const cached = cache.get(key)
  const now = Date.now()

  if (cached && (now - cached.timestamp) < ttl) {
    return cached.data
  }

  const data = await fetcher()
  cache.set(key, { data, timestamp: now })
  return data
}

// 使用示例
export async function getCachedImages(page: number = 0) {
  return getCachedData(
    `images-${page}`,
    async () => {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(page * 20, (page + 1) * 20 - 1)

      if (error) throw error
      return data
    }
  )
}
```

## 8. 错误处理和监控

### 8.1 错误处理中间件

```typescript
// utils/errorHandler.ts
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

export function handleSupabaseError(error: any): SupabaseError {
  if (error.code === 'PGRST116') {
    return new SupabaseError('数据不存在', error.code, error.details)
  }
  
  if (error.code === '23505') {
    return new SupabaseError('数据已存在', error.code, error.details)
  }
  
  if (error.code === '42501') {
    return new SupabaseError('权限不足', error.code, error.details)
  }

  return new SupabaseError(
    error.message || '操作失败',
    error.code,
    error.details
  )
}
```

### 8.2 监控和日志

```typescript
// utils/monitoring.ts
export function logSupabaseOperation(
  operation: string,
  table: string,
  userId?: string,
  metadata?: any
) {
  console.log({
    timestamp: new Date().toISOString(),
    operation,
    table,
    userId,
    metadata,
    source: 'supabase'
  })
}

// 在关键操作中添加日志
export async function logImageUpload(userId: string, imageId: string) {
  logSupabaseOperation('INSERT', 'images', userId, { imageId })
}
```

## 9. 部署配置

### 9.1 环境配置

```bash
# 生产环境变量
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# 数据库连接池配置
DATABASE_POOL_SIZE=20
DATABASE_MAX_CONNECTIONS=100
```

### 9.2 Vercel部署配置

```json
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
  }
}
```

## 10. 测试策略

### 10.1 单元测试

```typescript
// __tests__/supabase.test.ts
import { supabase } from '@/lib/supabase'

describe('Supabase Integration', () => {
  test('should connect to Supabase', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    expect(error).toBeNull()
  })

  test('should handle authentication', async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword'
    })
    
    expect(error).toBeNull()
    expect(data.user).toBeDefined()
  })
})
```

### 10.2 集成测试

```typescript
// __tests__/imageUpload.test.ts
import { uploadImage } from '@/services/imageUpload'

describe('Image Upload', () => {
  test('should upload image successfully', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const uploadData = {
      file: mockFile,
      title: 'Test Image',
      aircraftRegistration: 'B-1234',
      airline: 'Test Airline',
      airport: 'Test Airport',
      cameraModel: 'Test Camera',
      aircraftModel: 'Test Aircraft'
    }

    const result = await uploadImage(uploadData, 'test-user-id')
    expect(result.success).toBe(true)
  })
})
```

这个集成指南提供了完整的Supabase实施方案，涵盖了从基础配置到高级功能的各个方面，为航空摄影图库项目的开发提供了详细的技术指导。
