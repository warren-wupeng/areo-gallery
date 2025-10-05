import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '重置密码 - 航空摄影图库',
  description: '密码重置确认页面',
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          重置密码
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          请输入您的新密码
        </p>
      </div>

      <form className="space-y-4">
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            新密码
          </label>
          <input
            type="password"
            id="new-password"
            name="new-password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="请输入新密码（至少8位，包含字母和数字）"
            required
          />
        </div>

        <div>
          <label
            htmlFor="confirm-new-password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            确认新密码
          </label>
          <input
            type="password"
            id="confirm-new-password"
            name="confirm-new-password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="请再次输入新密码"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          重置密码
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          密码重置成功后，您将自动跳转到登录页面
        </p>
      </div>
    </div>
  );
}
