import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { 
  isAdmin, 
  updateUserRole, 
  getAllUsers,
  getUserStats,
  logUserActivityWithFunction 
} from '@/lib/database-simplified';
import { z } from 'zod';

// 验证角色更新数据的schema
const roleUpdateSchema = z.object({
  userId: z.string().uuid('用户ID格式不正确'),
  role: z.enum(['user', 'admin'], { message: '角色必须是user或admin' })
});

// 管理员相关 API
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 获取当前用户会话
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 检查当前用户是否为管理员
    const isCurrentUserAdmin = await isAdmin(session.user.id);
    if (!isCurrentUserAdmin) {
      return NextResponse.json(
        { error: '权限不足，需要管理员权限' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'update_role':
        return handleRoleUpdate(data, session.user.id, request);
      case 'get_users':
        return handleGetUsers(data);
      case 'get_stats':
        return handleGetStats();
      default:
        return NextResponse.json(
          { error: '无效的操作' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
}

// 更新用户角色
async function handleRoleUpdate(
  data: { userId: string; role: 'user' | 'admin' }, 
  adminId: string, 
  request: NextRequest
) {
  // 验证输入数据
  const validationResult = roleUpdateSchema.safeParse(data);
  if (!validationResult.success) {
    return NextResponse.json(
      { 
        error: '数据验证失败',
        details: validationResult.error.issues
      },
      { status: 400 }
    );
  }

  const { userId, role } = validationResult.data;

  // 不能修改自己的角色
  if (userId === adminId) {
    return NextResponse.json(
      { error: '不能修改自己的角色' },
      { status: 400 }
    );
  }

  // 更新用户角色
  const success = await updateUserRole(userId, role);
  
  if (!success) {
    return NextResponse.json(
      { error: '更新用户角色失败' },
      { status: 500 }
    );
  }

  // 记录管理员操作
  await logUserActivityWithFunction(
    'ADMIN_ROLE_UPDATE',
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    request.headers.get('user-agent') || 'unknown',
    { 
      target_user_id: userId, 
      new_role: role,
      admin_id: adminId
    }
  );

  return NextResponse.json({
    success: true,
    message: `用户角色已更新为${role === 'admin' ? '管理员' : '普通用户'}`,
    data: { userId, role }
  });
}

// 获取用户列表
async function handleGetUsers(data: { limit?: number; offset?: number }) {
  const { limit = 50, offset = 0 } = data;

  // 验证分页参数
  if (limit < 1 || limit > 100) {
    return NextResponse.json(
      { error: '每页数量必须在1-100之间' },
      { status: 400 }
    );
  }

  if (offset < 0) {
    return NextResponse.json(
      { error: '偏移量不能为负数' },
      { status: 400 }
    );
  }

  const users = await getAllUsers(limit, offset);

  return NextResponse.json({
    success: true,
    data: users,
    pagination: {
      limit,
      offset,
      count: users.length
    }
  });
}

// 获取用户统计信息
async function handleGetStats() {
  const stats = await getUserStats();

  if (!stats) {
    return NextResponse.json(
      { error: '获取统计信息失败' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: stats
  });
}
