import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '验证码验证 - 航空摄影图库',
  description: '验证码验证页面',
};

export default function VerifyPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          验证码验证
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          请输入发送到您联系方式的验证码
        </p>
      </div>

      <form className="space-y-4">
        <div>
          <label
            htmlFor="verification-code"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            验证码
          </label>
          <input
            type="text"
            id="verification-code"
            name="verification-code"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg tracking-widest shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="000000"
            maxLength={6}
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            设置密码
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="请输入密码（至少8位，包含字母和数字）"
            required
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            确认密码
          </label>
          <input
            type="password"
            id="confirm-password"
            name="confirm-password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="请再次输入密码"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          完成注册
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          没有收到验证码？{' '}
          <button
            type="button"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            重新发送
          </button>
        </p>
      </div>
    </div>
  );
}
