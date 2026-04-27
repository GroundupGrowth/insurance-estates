export default function BrainstormLoading() {
  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div className="skeleton h-9 w-40" />
        <div className="skeleton h-9 w-28" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-app-border bg-white p-6 space-y-3"
          >
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-5/6" />
          </div>
        ))}
      </div>
    </>
  );
}
