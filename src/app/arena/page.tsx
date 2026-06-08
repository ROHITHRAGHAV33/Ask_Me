import QuestionsList from "../questions-list";

// Force dynamic rendering (avoid caching build-time static HTML)
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      {/* Background Image & Radial Gradient Overlays */}
      <div className="fitness-bg-overlay" />
      <div className="fitness-bg-gradient" />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12 relative z-10">
        <header className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">
                FitQuest Arena Live
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              FITQUEST
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-md">
              Test your fitness knowledge, vote on active polls, climb the leaderboard, and earn balance coins!
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3 justify-center">
            <div className="bg-slate-900/60 backdrop-blur border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-400 flex items-center gap-2">
              <span className="text-amber-400">🔥</span> Learn & Earn Points
            </div>
          </div>
        </header>

        {/* Load Client-side Quiz Component */}
        <QuestionsList />
      </main>
    </>
  );
}
