-- 最终简化版 Row Level Security (RLS) 策略设置
-- 基于 Supabase Auth 内置功能，仅支持邮箱登录
-- 创建时间: 2024-01-01

-- 1. 启用Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- 2. 用户档案表 (profiles) RLS策略

-- 2.1 用户只能查看自己的档案
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- 2.2 用户只能更新自己的档案
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2.3 用户只能插入自己的档案（通过触发器自动创建）
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2.4 管理员可以查看所有用户档案
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2.5 管理员可以更新所有用户档案
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2.6 公开用户档案信息（用于显示用户名、头像等）
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- 3. 用户活动日志表 (user_activity_logs) RLS策略

-- 3.1 用户可以记录自己的活动日志
CREATE POLICY "Users can record their own activity" ON public.user_activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3.2 用户只能查看自己的活动日志
CREATE POLICY "Users can view their own activity logs" ON public.user_activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 3.3 管理员可以查看所有活动日志
CREATE POLICY "Admins can view all activity logs" ON public.user_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. 创建安全函数

-- 4.1 检查用户是否为管理员的函数
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.2 获取用户角色的函数
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.3 记录用户活动的函数
CREATE OR REPLACE FUNCTION log_user_activity(
  action_type TEXT,
  ip_addr INET DEFAULT NULL,
  user_agent_text TEXT DEFAULT NULL,
  metadata_json JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_activity_logs (
    user_id, 
    action, 
    ip_address, 
    user_agent, 
    metadata
  ) VALUES (
    auth.uid(),
    action_type,
    ip_addr,
    user_agent_text,
    metadata_json
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 创建安全视图

-- 5.1 公开用户信息视图（只包含可公开的信息）
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  bio,
  created_at
FROM public.profiles;

-- 5.2 管理员用户统计视图
CREATE VIEW public.admin_user_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d
FROM public.profiles;

-- 6. 设置视图的RLS策略
ALTER VIEW public.public_profiles SET (security_invoker = true);
ALTER VIEW public.admin_user_stats SET (security_invoker = true);

-- 7. 添加策略注释
COMMENT ON POLICY "Users can view their own profile" ON public.profiles IS '用户只能查看自己的档案信息';
COMMENT ON POLICY "Users can update their own profile" ON public.profiles IS '用户只能更新自己的档案信息';
COMMENT ON POLICY "Admins can view all profiles" ON public.profiles IS '管理员可以查看所有用户档案';
COMMENT ON POLICY "Admins can update all profiles" ON public.profiles IS '管理员可以更新所有用户档案';
COMMENT ON POLICY "Public profiles are viewable by everyone" ON public.profiles IS '公开用户档案信息供所有人查看';

COMMENT ON POLICY "Users can record their own activity" ON public.user_activity_logs IS '用户可以记录自己的活动';
COMMENT ON POLICY "Users can view their own activity logs" ON public.user_activity_logs IS '用户只能查看自己的活动日志';
COMMENT ON POLICY "Admins can view all activity logs" ON public.user_activity_logs IS '管理员可以查看所有活动日志';

-- 8. 函数注释
COMMENT ON FUNCTION is_admin(UUID) IS '检查用户是否为管理员';
COMMENT ON FUNCTION get_user_role(UUID) IS '获取用户角色';
COMMENT ON FUNCTION log_user_activity(TEXT, INET, TEXT, JSONB) IS '记录用户活动日志';
COMMENT ON FUNCTION cleanup_old_activity_logs() IS '清理旧的活动日志';
