export default function TasksLoading() {
  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div className="skeleton h-9 w-32" />
        <div className="skeleton h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-app-border bg-white p-6 space-y-2"
          >
            <div className="skeleton h-5 w-24" />
            <div className="skeleton h-16 w-full" />
            <div className="skeleton h-16 w-full" />
          </div>
        ))}
      </div>
    </>
  );
}
