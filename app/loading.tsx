export default function HomeLoading() {
  return (
    <div className="flex flex-col pt-8 pb-28 animate-pulse">
      {/* Header */}
      <header className="px-6 mb-8 flex items-center justify-between">
        <div className="w-32 h-7 bg-slate-800 rounded-full" />
        <div className="w-10 h-10 bg-navy-900 border border-slate-700/50 rounded-2xl" />
      </header>

      {/* Stats */}
      <section className="px-6 mb-8">
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-navy-900/40 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      </section>

      {/* Book list */}
      <section className="px-6 space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="card-premium flex gap-4 items-center p-4">
            <div className="w-16 h-24 flex-shrink-0 bg-navy-800 rounded-xl border border-slate-700/50" />
            <div className="flex-grow space-y-2">
              <div className="h-4 bg-slate-800 rounded-full w-4/5" />
              <div className="h-3 bg-slate-800/60 rounded-full w-2/5" />
              <div className="h-5 w-12 bg-slate-800/40 rounded-full" />
            </div>
            <div className="w-5 h-5 bg-slate-800/40 rounded-full flex-shrink-0" />
          </div>
        ))}
      </section>
    </div>
  );
}
