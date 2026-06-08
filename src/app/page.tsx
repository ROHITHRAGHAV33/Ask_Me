import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      {/* Background Image & Radial Gradient Overlays */}
      <div className="fitness-bg-overlay" />
      <div className="fitness-bg-gradient" />

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col justify-between py-12 px-4 relative z-10">
        {/* Navbar-like Header */}
        <header className="mx-auto w-full max-w-6xl flex justify-between items-center pb-6 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-black tracking-widest text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              FITQUEST
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] md:text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Arena Open
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto w-full max-w-6xl my-auto py-12 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-800 px-4 py-1.5 rounded-full text-xs text-cyan-400 font-semibold mb-6 shadow-lg shadow-cyan-950/20">
            <span className="animate-pulse text-purple-400">🔮</span> Gemini AI Integrated Fitness Platform
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white max-w-4xl">
            ELEVATE YOUR{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent glow-text-cyan">
              FITNESS IQ
            </span>
          </h1>
          <p className="mt-6 text-base md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            Welcome to the ultimate gamified arena where fitness science meets interactive trivia. Solve questions, cast community votes, generate AI insights, and climb the leaderboard!
          </p>

          {/* CTA Button */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/arena"
              className="group relative bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-95 px-8 py-4 rounded-xl font-black text-slate-950 tracking-wider shadow-xl shadow-cyan-950/30 transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer flex items-center gap-2.5"
            >
              ENTER THE ARENA ⚔️
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900 p-4 rounded-2xl flex flex-col justify-center items-center">
              <span className="text-2xl font-black text-white">5+</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Categories</span>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900 p-4 rounded-2xl flex flex-col justify-center items-center">
              <span className="text-2xl font-black text-amber-400">🪙 Earnable</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Wallet Coins</span>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900 p-4 rounded-2xl flex flex-col justify-center items-center">
              <span className="text-2xl font-black text-cyan-400">Gemini</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">AI Enhancements</span>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900 p-4 rounded-2xl flex flex-col justify-center items-center">
              <span className="text-2xl font-black text-emerald-400">Live</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Leaderboard</span>
            </div>
          </div>

          {/* Core Features Cards */}
          <div className="mt-20 w-full text-left">
            <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-10 tracking-tight">
              DISCOVER THE FITQUEST PILLARS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-cyan-500 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-cyan-950/50 border border-cyan-800/50 rounded-xl flex items-center justify-center text-xl mb-4">
                    ⚔️
                  </div>
                  <h3 className="font-bold text-lg text-white mb-2">Quest Trivia Arena</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Test your knowledge on nutrition science, strength training, hypertrophy, and recovery. Submit community questions and earn coins for every correct answer.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-purple-500 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-purple-950/50 border border-purple-800/50 rounded-xl flex items-center justify-center text-xl mb-4">
                    🔮
                  </div>
                  <h3 className="font-bold text-lg text-white mb-2">AI Question Enhancer</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Unleash Gemini AI to optimize your draft questions. Formulate scientifically sound trivia, customize category styles, and publish polished interactive questions.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-emerald-950/50 border border-emerald-800/50 rounded-xl flex items-center justify-center text-xl mb-4">
                    📰
                  </div>
                  <h3 className="font-bold text-lg text-white mb-2">AI Fitness Pulse</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Generate deep-dive educational insights on training or biohacking with AI, or browse built-in articles on Zone 2 cardio, creatine mechanisms, and hypertrophy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mx-auto w-full max-w-6xl pt-6 border-t border-slate-950 text-center flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FitQuest Arena. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition-colors">Training</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors">Nutrition</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors">Longevity</span>
          </div>
        </footer>
      </div>
    </>
  );
}