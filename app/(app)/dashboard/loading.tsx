export default function DashboardLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-8 rounded-2xl border border-app-border bg-white p-6">
        <div className="skeleton h-9 w-48" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-9 w-full" />
          ))}
        </div>
      </div>
      <div className="md:col-span-4 rounded-2xl border border-app-border bg-white p-6 flex flex-col items-center justify-center">
        <div className="skeleton h-[180px] w-[180px] rounded-full" />
      </div>
      <div className="md:col-span-12 flex gap-3">
        <div className="skeleton h-10 w-32 rounded-full" />
        <div className="skeleton h-10 w-36 rounded-full" />
        <div className="skeleton h-10 w-32 rounded-full" />
      </div>
    </div>
  );
}
