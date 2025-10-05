import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '忘记密码 - 航空摄影图库',
  description: '密码重置页面',
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          忘记密码
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          输入您的联系方式，我们将发送重置链接
        </p>
      </div>

      <form className="space-y-4">
        <div>
          <label
            htmlFor="contact"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            邮箱或手机号
          </label>
          <input
            type="text"
            id="contact"
            name="contact"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="请输入注册时的邮箱或手机号"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          发送重置链接
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          记起密码了？{' '}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            返回登录
          </Link>
        </p>
      </div>
    </div>
  );
}
