import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '认证 - 航空摄影图库',
  description: '用户登录、注册和密码重置',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* 品牌标识 */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              航空摄影图库
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Aero Gallery
            </p>
          </div>
          
          {/* 认证内容 */}
          <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            {children}
          </div>
          
          {/* 页脚 */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2024 航空摄影图库. 保留所有权利.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
