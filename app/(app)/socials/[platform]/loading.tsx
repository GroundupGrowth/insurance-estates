export default function SocialsLoading() {
  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div className="skeleton h-9 w-32" />
        <div className="skeleton h-9 w-32" />
      </div>
      <div className="mb-6 flex items-center gap-2">
        <div className="skeleton h-10 w-72 rounded-lg" />
      </div>
      <div className="rounded-2xl border border-app-border bg-white p-6">
        <div className="skeleton h-7 w-40 mb-4" />
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="skeleton h-20 w-full" />
          ))}
        </div>
      </div>
    </>
  );
}
