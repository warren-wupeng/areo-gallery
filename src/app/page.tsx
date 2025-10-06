import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-black text-white">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-white">
          航空摄影图库
        </h1>
        <p className="text-gray-400 text-center sm:text-left">
          欢迎来到航空摄影图库，探索精彩的航空摄影作品
        </p>
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left text-gray-300">
          <li className="mb-2 tracking-[-.01em]">
            开始探索精彩的航空摄影作品
          </li>
          <li className="tracking-[-.01em]">
            注册账户，上传您的航空摄影作品
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-indigo-600 text-white gap-2 hover:bg-indigo-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/register"
          >
            立即注册
          </a>
          <a
            className="rounded-full border border-solid border-gray-600 transition-colors flex items-center justify-center hover:bg-gray-800 hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px] text-white"
            href="/login"
          >
            登录账户
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-gray-400">
        <p>© 2024 航空摄影图库. 保留所有权利.</p>
      </footer>
    </div>
  );
}
