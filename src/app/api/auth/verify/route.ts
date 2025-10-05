import { NextRequest, NextResponse } from 'next/server';

// 验证码相关 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'send':
        return handleSendVerificationCode(data);
      case 'confirm':
        return handleConfirmVerificationCode(data);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 发送验证码
async function handleSendVerificationCode(data: any) {
  const { contact, type } = data;

  // 验证输入
  if (!contact || !type) {
    return NextResponse.json(
      { error: '联系方式和验证类型不能为空' },
      { status: 400 }
    );
  }

  // 验证联系方式格式
  if (type === 'email' && !isValidEmail(contact)) {
    return NextResponse.json(
      { error: '邮箱格式不正确' },
      { status: 400 }
    );
  }

  if (type === 'phone' && !isValidPhone(contact)) {
    return NextResponse.json(
      { error: '手机号格式不正确' },
      { status: 400 }
    );
  }

  // TODO: 实现实际的验证码发送逻辑
  // 1. 生成6位数字验证码
  // 2. 检查发送频率限制（1分钟间隔）
  // 3. 发送短信/邮件
  // 4. 存储验证码到数据库（5分钟有效期）
  // 5. 记录发送日志

  const verificationCode = generateVerificationCode();

  return NextResponse.json({
    message: '验证码发送成功',
    data: {
      contact,
      type,
      // 开发环境返回验证码，生产环境不返回
      ...(process.env.NODE_ENV === 'development' && { code: verificationCode }),
    },
  });
}

// 确认验证码
async function handleConfirmVerificationCode(data: any) {
  const { contact, code, type } = data;

  // 验证输入
  if (!contact || !code || !type) {
    return NextResponse.json(
      { error: '联系方式、验证码和类型不能为空' },
      { status: 400 }
    );
  }

  // TODO: 实现实际的验证码确认逻辑
  // 1. 查询数据库中的验证码
  // 2. 检查验证码是否正确
  // 3. 检查验证码是否过期
  // 4. 检查验证码是否已被使用
  // 5. 标记验证码为已使用
  // 6. 记录验证日志

  return NextResponse.json({
    message: '验证码确认功能待实现',
    data: { contact, type },
  });
}

// 生成6位数字验证码
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 验证邮箱格式
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 验证手机号格式（中国大陆）
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}
