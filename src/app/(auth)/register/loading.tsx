export default function RegisterLoading() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="mx-auto mt-2 h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-12 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>

        <div>
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mt-1 h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>

        <div className="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      <div className="text-center">
        <div className="mx-auto h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  );
}
