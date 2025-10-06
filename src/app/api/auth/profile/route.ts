import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { 
  getUserProfile, 
  updateUserProfile, 
  isUsernameAvailable,
  logUserActivityWithFunction 
} from '@/lib/database-simplified';
import { z } from 'zod';

// 验证用户档案更新数据的schema
const profileUpdateSchema = z.object({
  username: z.string().min(3, '用户名至少3位').max(20, '用户名最多20位').optional(),
  full_name: z.string().max(50, '姓名最多50位').optional(),
  bio: z.string().max(500, '个人简介最多500字').optional(),
  avatar_url: z.string().url('头像URL格式不正确').optional()
});

// 获取用户档案
export async function GET(request: NextRequest) {
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

    // 获取用户档案
    const profile = await getUserProfile(session.user.id);
    
    if (!profile) {
      return NextResponse.json(
        { error: '用户档案不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: '获取用户档案失败' },
      { status: 500 }
    );
  }
}

// 更新用户档案
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    
    // 验证输入数据
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '数据验证失败',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const updates = validationResult.data;
    
    // 如果更新用户名，检查是否可用
    if (updates.username) {
      const isAvailable = await isUsernameAvailable(updates.username);
      if (!isAvailable) {
        return NextResponse.json(
          { error: '用户名已被使用' },
          { status: 409 }
        );
      }
    }

    // 更新用户档案
    const updatedProfile = await updateUserProfile(session.user.id, {
      ...updates,
      updated_at: new Date().toISOString()
    });

    if (!updatedProfile) {
      return NextResponse.json(
        { error: '更新用户档案失败' },
        { status: 500 }
      );
    }

    // 记录用户活动
    await logUserActivityWithFunction(
      'PROFILE_UPDATE',
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      { updated_fields: Object.keys(updates) }
    );

    return NextResponse.json({
      success: true,
      message: '用户档案更新成功',
      data: updatedProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: '更新用户档案失败' },
      { status: 500 }
    );
  }
}

// 删除用户档案（软删除，实际是清空敏感信息）
export async function DELETE(request: NextRequest) {
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

    // 清空用户档案中的敏感信息，但保留记录
    const updatedProfile = await updateUserProfile(session.user.id, {
      username: null,
      full_name: null,
      bio: null,
      avatar_url: null,
      updated_at: new Date().toISOString()
    });

    if (!updatedProfile) {
      return NextResponse.json(
        { error: '删除用户档案失败' },
        { status: 500 }
      );
    }

    // 记录用户活动
    await logUserActivityWithFunction(
      'PROFILE_DELETE',
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      { action: 'profile_data_cleared' }
    );

    return NextResponse.json({
      success: true,
      message: '用户档案已删除'
    });

  } catch (error) {
    console.error('Delete profile error:', error);
    return NextResponse.json(
      { error: '删除用户档案失败' },
      { status: 500 }
    );
  }
}
