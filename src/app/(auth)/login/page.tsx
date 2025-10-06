import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '登录 - 航空摄影图库',
  description: '用户登录页面',
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">
          欢迎回来
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          登录您的账户以继续使用
        </p>
      </div>

      <form className="space-y-4">
        <div>
          <label
            htmlFor="contact"
            className="block text-sm font-medium text-gray-300"
          >
            邮箱或手机号
          </label>
          <input
            type="text"
            id="contact"
            name="contact"
            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 placeholder-gray-400"
            placeholder="请输入邮箱或手机号"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300"
          >
            密码
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 placeholder-gray-400"
            placeholder="请输入密码"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-300">
              记住我
            </label>
          </div>

          <Link
            href="/forgot-password"
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            忘记密码？
          </Link>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          登录
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          还没有账户？{' '}
          <Link
            href="/register"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
