-- 最终简化版用户认证系统数据库Schema
-- 基于 Supabase Auth 内置功能，仅支持邮箱登录
-- 创建时间: 2024-01-01

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 用户档案表 (profiles)
-- 只存储 Supabase Auth 不提供的额外信息
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

-- 2. 用户活动日志表 (user_activity_logs)
-- 用于安全监控和审计（可选）
CREATE TABLE public.user_activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建性能优化索引
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_role ON public.profiles(role);

CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_action ON public.user_activity_logs(action);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);

-- 4. 设置数据完整性约束
-- 用户名长度约束
ALTER TABLE public.profiles ADD CONSTRAINT check_username_length 
  CHECK (username IS NULL OR (length(username) >= 3 AND length(username) <= 20));

-- 5. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. 创建用户档案自动创建触发器
-- 当 auth.users 表插入新用户时，自动创建对应的 profiles 记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. 创建清理旧活动日志的函数
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_activity_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- 8. 添加表注释
COMMENT ON TABLE public.profiles IS '用户档案表，存储 Supabase Auth 不提供的额外信息';
COMMENT ON TABLE public.user_activity_logs IS '用户活动日志表，用于安全监控和审计';

COMMENT ON COLUMN public.profiles.username IS '用户名，3-20个字符，唯一';
COMMENT ON COLUMN public.profiles.role IS '用户角色：user(普通用户) 或 admin(管理员)';

COMMENT ON COLUMN public.user_activity_logs.action IS '用户操作类型';
COMMENT ON COLUMN public.user_activity_logs.metadata IS '操作相关的额外数据';
