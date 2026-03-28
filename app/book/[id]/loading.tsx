export default function BookDetailLoading() {
  return (
    <div className="flex flex-col pb-20 pt-8 bg-navy-950 animate-pulse">
      {/* Header */}
      <header className="px-6 mb-8 flex items-center justify-between">
        <div className="w-10 h-10 bg-navy-900 border border-slate-700/50 rounded-2xl" />
        <div className="w-24 h-5 bg-slate-800 rounded-full" />
        <div className="w-10 h-10" />
      </header>

      {/* Cover */}
      <section className="px-6 mb-12 flex flex-col items-center">
        <div className="w-48 h-72 bg-navy-800 rounded-[32px] border-4 border-slate-800/80 mb-8" />
        <div className="text-center w-full max-w-[300px] space-y-3">
          <div className="h-8 bg-slate-800 rounded-full mx-auto w-4/5" />
          <div className="h-4 bg-slate-800/60 rounded-full mx-auto w-2/3" />
          <div className="flex justify-center gap-2">
            <div className="h-6 w-20 bg-slate-800/60 rounded-full" />
            <div className="h-6 w-24 bg-slate-800/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* Status selector */}
      <section className="px-6 mb-12">
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-navy-900/40 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      </section>

      {/* Review area */}
      <section className="px-6 mb-12">
        <div className="card-premium space-y-6">
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-8 bg-slate-800 rounded-full" />
            ))}
          </div>
          <div className="w-full h-32 bg-navy-950/50 border border-slate-700/50 rounded-2xl" />
          <div className="w-full h-14 bg-slate-800/60 rounded-2xl" />
        </div>
      </section>
    </div>
  );
}
