import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '注册 - 航空摄影图库',
  description: '用户注册页面',
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          创建账户
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          选择注册方式并完成账户创建
        </p>
      </div>

      {/* 注册方式选择 */}
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            选择注册方式
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            📧 邮箱注册
          </button>
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            📱 手机注册
          </button>
        </div>
      </div>

      {/* 注册表单 */}
      <form className="space-y-4">
        <div>
          <label
            htmlFor="contact"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            联系方式
          </label>
          <input
            type="text"
            id="contact"
            name="contact"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="请输入邮箱或手机号"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          发送验证码
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          已有账户？{' '}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
