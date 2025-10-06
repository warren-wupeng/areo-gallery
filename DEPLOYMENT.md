# Fly.io 部署指南

## 前置条件

1. ✅ 已安装 flyctl
2. ✅ 已登录 Fly.io 账户
3. ⚠️ 需要验证账户（高风险标记）

## 部署步骤

### 1. 验证账户
访问 https://fly.io/high-risk-unlock 验证你的账户

### 2. 创建应用
```bash
flyctl apps create aero-gallery-2024 --org personal
```

### 3. 设置环境变量
```bash
# 设置 Supabase 环境变量
flyctl secrets set NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
flyctl secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# 设置其他环境变量（可选）
flyctl secrets set SMS_API_KEY="your_sms_api_key"
flyctl secrets set SMS_API_SECRET="your_sms_api_secret"
flyctl secrets set SMTP_HOST="smtp.gmail.com"
flyctl secrets set SMTP_PORT="587"
flyctl secrets set SMTP_USER="your_email@gmail.com"
flyctl secrets set SMTP_PASS="your_app_password"
```

### 4. 部署应用
```bash
flyctl deploy
```

### 5. 查看应用状态
```bash
flyctl status
flyctl logs
```

### 6. 打开应用
```bash
flyctl open
```

## 配置文件说明

- `fly.toml`: Fly.io 应用配置
- `Dockerfile`: Docker 容器配置
- `.dockerignore`: Docker 构建忽略文件
- `next.config.ts`: Next.js 配置（已更新支持 standalone 输出）

## 注意事项

1. **环境变量**: 所有敏感信息都通过 `flyctl secrets set` 设置，不会暴露在代码中
2. **区域设置**: 默认使用香港区域 (hkg)，你可以根据需要修改
3. **资源限制**: 默认配置为 1 CPU 和 256MB 内存，适合小型应用
4. **自动扩展**: 配置了自动启停机器以节省成本

## 故障排除

### 构建失败
```bash
# 查看构建日志
flyctl logs --build

# 本地测试构建
docker build -t aero-gallery .
```

### 应用无法启动
```bash
# 查看运行时日志
flyctl logs

# 检查应用状态
flyctl status
```

### 环境变量问题
```bash
# 查看所有环境变量
flyctl secrets list

# 删除环境变量
flyctl secrets unset VARIABLE_NAME
```

## 更新部署

```bash
# 重新部署
flyctl deploy

# 回滚到上一个版本
flyctl releases list
flyctl releases rollback <release-id>
```
