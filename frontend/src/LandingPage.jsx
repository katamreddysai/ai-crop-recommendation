import React from 'react';
import {
  Sprout,
  ArrowRight,
  AlertTriangle,
  CloudSun,
  BookOpen,
  FlaskConical,
  CheckCircle2,
  History,
  HelpCircle,
  Database,
  TrendingUp,
  Calendar,
  MapPin,
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Problem', href: '#problem' },
  { label: 'Solution', href: '#solution' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
];

const PROBLEMS = [
  {
    icon: Sprout,
    title: 'Wrong crop, lost season',
    body: 'A crop chosen by guesswork can fail outright — wrong soil, wrong pH, wrong rainfall. One bad choice can wipe out an entire season of income.',
  },
  {
    icon: FlaskConical,
    title: 'Blind fertilization',
    body: 'Farmers either over-apply costly N-P-K fertilizers or starve the soil of the exact nutrients it needs, degrading soil health year after year.',
  },
  {
    icon: CloudSun,
    title: 'Unpredictable weather',
    body: 'Kharif, Rabi and Zaid seasons each demand different conditions. Without local climate insight, irrigation and sowing decisions are pure trial and error.',
  },
  {
    icon: BookOpen,
    title: 'Knowledge out of reach',
    body: 'Agronomists and soil labs are scarce in rural areas, leaving farmers without accessible, field-specific guidance when decisions matter most.',
  },
];

const SOLUTION_POINTS = [
  'Estimates soil N-P-K and pH from your soil type and field history — or ingests your lab Soil Health Card values directly.',
  'Synthesizes seasonal climate signals: temperature, humidity and effective rainfall for your location.',
  'A trained Random Forest model ranks 22 crops and returns the best match with a confidence score.',
  'Every recommendation is explained in plain language — why this crop, and the top 3 alternatives.',
];

const FEATURES = [
  {
    icon: TrendingUp,
    title: 'AI Crop Recommendation',
    body: 'A Random Forest classifier trained on agronomic profiles returns your optimal crop with a probability score.',
  },
  {
    icon: FlaskConical,
    title: 'Soil Health Card Ready',
    body: 'Paste lab-measured N, P, K and pH values when you have them — the model uses them instead of estimates.',
  },
  {
    icon: CloudSun,
    title: 'Season & Climate Aware',
    body: 'Kharif, Rabi and Zaid season logic combined with temperature, humidity and rainfall indices.',
  },
  {
    icon: HelpCircle,
    title: 'Explainable Results',
    body: 'A plain-language "Why this crop?" rationale plus your top 3 candidates with confidence percentages.',
  },
  {
    icon: History,
    title: 'Full Search History',
    body: 'Every prediction is logged with its calculated features, so you can revisit and compare past decisions.',
  },
  {
    icon: Database,
    title: 'Live Insights Dashboard',
    body: 'Track total predictions, top crops, districts scanned and soil tests used — all in one dashboard.',
  },
];

const STEPS = [
  {
    number: '01',
    icon: MapPin,
    title: 'Describe your field',
    body: 'Share your location, target season, soil texture class, previous crop and whether irrigation is available.',
  },
  {
    number: '02',
    icon: FlaskConical,
    title: 'We estimate soil & climate',
    body: 'The engine synthesizes N-P-K, pH, temperature, humidity and rainfall — or uses your exact lab test values.',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Get your crop plan',
    body: 'Receive your recommended crop, confidence score, top 3 alternatives, comparison charts and sowing tips.',
  },
];

const HERO_STATS = [
  { value: '22', label: 'Crops supported' },
  { value: 'N-P-K', label: 'Soil nutrient modeling' },
  { value: '3', label: 'Growing seasons' },
  { value: 'RF', label: 'Random Forest AI' },
];

export default function LandingPage({ onOpenDashboard }) {
  return (
    <div className="min-h-screen bg-[#f5f8fc] text-navy-900">
      {/* ============================ TOP MENU BAR ============================ */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-lg border-b border-navy-100/80">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <a href="#top" className="flex items-center gap-2.5 shrink-0 group">
            <span className="bg-gradient-crop p-2 rounded-xl shadow-glow-green">
              <Sprout size={18} />
            </span>
            <span className="leading-tight">
              <span className="block font-display font-extrabold text-navy-900 text-sm sm:text-base tracking-tight">
                AgroRecommend
              </span>
              <span className="block text-[10px] font-semibold text-primary-600 uppercase tracking-widest">
                AI Crop Intelligence
              </span>
            </span>
          </a>

          {/* Anchor links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-xs font-bold text-navy-700 hover:text-primary-600 hover:bg-primary-50/70 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Redirect to Dashboard */}
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-glow-green transition-all duration-200 group"
          >
            Open Dashboard
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </header>

      {/* ================================ HERO ================================ */}
      <section id="top" className="relative overflow-hidden bg-gradient-brand text-white">
        {/* Decorative glows */}
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-primary-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 w-[420px] h-[420px] rounded-full bg-primary-400/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-300">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse" />
              AI-Powered Agronomy Platform
            </span>

            <h1 className="mt-6 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight">
              The right crop for your soil.
              <span className="block text-gradient bg-gradient-to-r from-primary-400 via-primary-300 to-white bg-clip-text text-transparent">
                Every single season.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-navy-200 leading-relaxed max-w-2xl">
              AgroRecommend reads your soil, season and local climate, then uses a trained
              machine-learning model to tell you exactly what to grow — with the reasoning
              written in plain language, not jargon.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenDashboard}
                className="flex items-center gap-2.5 px-7 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold shadow-glow-green transition-all duration-200 group"
              >
                Open the Dashboard
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#problem"
                className="flex items-center gap-2.5 px-7 py-4 border border-white/20 hover:border-primary-400 hover:bg-white/5 text-white rounded-xl text-sm font-bold transition-all duration-200"
              >
                See the problem we solve
              </a>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-14 lg:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4"
              >
                <div className="font-display font-extrabold text-2xl text-white">{stat.value}</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-navy-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= PROBLEM STATEMENT ======================= */}
      <section id="problem" className="py-20 lg:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="eyebrow">
              <AlertTriangle size={13} /> The Problem
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-navy-900 leading-tight">
              Farming decisions shouldn't be a gamble.
            </h2>
            <p className="mt-4 text-navy-600 leading-relaxed">
              Across small and mid-sized farms, crop selection still relies on tradition and
              guesswork. The cost of one wrong decision is measured in lost harvests, wasted
              fertilizer and depleted soil.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROBLEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="glass-card p-6 flex flex-col gap-4 hover:-translate-y-1"
                >
                  <div className="w-11 h-11 rounded-xl bg-navy-950 text-primary-400 flex items-center justify-center shrink-0">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display font-bold text-navy-900 text-base leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-navy-600 leading-relaxed">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================== SOLUTION =========================== */}
      <section id="solution" className="relative overflow-hidden bg-gradient-brand text-white py-20 lg:py-28 scroll-mt-20">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-primary-500/[0.12] blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-start">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-400">
                <CheckCircle2 size={13} /> The Solution
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight">
                From soil test to sowing decision —{' '}
                <span className="text-primary-400">one intelligent platform.</span>
              </h2>
              <p className="mt-4 text-navy-200 leading-relaxed">
                AgroRecommend combines agronomic soil baselines, seasonal climate estimation
                and a trained Random Forest model into a single farmer-friendly workflow.
              </p>

              <ul className="mt-8 space-y-4">
                {SOLUTION_POINTS.map((point) => (
                  <li key={point} className="flex gap-3.5">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-primary-500/15 border border-primary-400/40 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} className="text-primary-400" />
                    </span>
                    <span className="text-sm text-navy-100 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onOpenDashboard}
                className="mt-9 flex items-center gap-2.5 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold shadow-glow-green transition-all group"
              >
                Try it on your field
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Mock recommendation card */}
            <div className="rounded-3xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-md p-6 sm:p-7 shadow-premium-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-400">
                  Recommended Crop
                </span>
                <span className="px-2.5 py-1 rounded-md bg-primary-500/15 border border-primary-400/30 text-[10px] font-bold text-primary-300">
                  Random Forest
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-navy-800 to-primary-500 flex items-center justify-center text-2xl shadow-glow-green">
                  🌾
                </div>
                <div>
                  <div className="font-display font-extrabold text-2xl text-white">Rice</div>
                  <div className="text-xs text-navy-300 font-medium">
                    Suitability confidence{' '}
                    <b className="text-primary-300">94.2%</b>
                  </div>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="mt-5 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-primary-500 to-primary-300" />
              </div>

              {/* Top 3 */}
              <div className="mt-6 space-y-3">
                {[
                  { crop: 'Rice', pct: 94.2 },
                  { crop: 'Jute', pct: 3.1 },
                  { crop: 'Maize', pct: 1.8 },
                ].map((row, idx) => (
                  <div key={row.crop} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2.5 text-navy-100 font-semibold">
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-primary-300">
                        {idx + 1}
                      </span>
                      {row.crop}
                    </span>
                    <span className="font-display font-bold text-white">{row.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Feature chips */}
              <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                {[
                  { k: 'N-P-K', v: '80-40-40' },
                  { k: 'pH', v: '6.5' },
                  { k: 'Season', v: 'Kharif' },
                ].map((chip) => (
                  <div key={chip.k} className="rounded-xl bg-white/5 py-2.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-navy-400">
                      {chip.k}
                    </div>
                    <div className="mt-0.5 text-xs font-bold text-white">{chip.v}</div>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-[11px] text-navy-300 leading-relaxed">
                <b className="text-primary-300">Why this crop?</b> Your soil's nitrogen-rich
                profile and the high seasonal rainfall in your location create the water-heavy
                conditions rice fields need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ FEATURES ============================ */}
      <section id="features" className="py-20 lg:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="eyebrow">
              <Sprout size={13} /> What You Get
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-navy-900 leading-tight">
              Everything a season plan needs.
            </h2>
            <p className="mt-4 text-navy-600 leading-relaxed">
              A focused toolset — no clutter, no noise. Just the data and guidance required to
              make confident cultivation decisions.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-card p-6 hover:-translate-y-1 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 border border-primary-100 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-colors">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 font-display font-bold text-navy-900 text-base">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-navy-600 leading-relaxed">{feature.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================== HOW IT WORKS ========================== */}
      <section id="how-it-works" className="pb-20 lg:pb-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="rounded-3xl border border-navy-100 bg-white/80 backdrop-blur-sm shadow-premium p-8 sm:p-10">
            <div className="max-w-2xl">
              <span className="eyebrow">
                <Calendar size={13} /> How It Works
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-navy-900 leading-tight">
                Three steps to a smarter season.
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="relative">
                    {idx < STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-7 left-[calc(100%-8px)] w-8 border-t-2 border-dashed border-navy-200" />
                    )}
                    <div className="flex items-center gap-3">
                      <span className="w-14 h-14 rounded-2xl bg-navy-950 text-primary-400 flex items-center justify-center">
                        <Icon size={22} />
                      </span>
                      <span className="font-display font-extrabold text-navy-300 text-lg">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display font-bold text-navy-900 text-base">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-navy-600 leading-relaxed">{step.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================= CTA BAND ============================= */}
      <section className="relative overflow-hidden bg-gradient-brand text-white">
        <div className="absolute -bottom-32 left-1/3 w-[400px] h-[400px] rounded-full bg-primary-500/15 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-16 lg:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug">
              Ready to know what to plant this season?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-navy-200 leading-relaxed">
              Open the dashboard, enter a few details about your field and get an AI-backed
              crop recommendation in seconds.
            </p>
          </div>
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-2.5 px-7 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold shadow-glow-green transition-all shrink-0 group"
          >
            Open Dashboard
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* ============================== FOOTER ============================== */}
      <footer className="border-t border-navy-100 bg-white/80">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="bg-gradient-crop p-2 rounded-xl">
              <Sprout size={16} />
            </span>
            <div className="leading-tight">
              <div className="font-display font-extrabold text-navy-900 text-sm">AgroRecommend</div>
              <div className="text-[11px] text-navy-500 font-medium">
                AI-Based Crop Recommendation Platform
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-bold text-navy-600 hover:text-primary-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={onOpenDashboard}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Dashboard
            </button>
          </nav>

          <p className="text-[11px] text-navy-400 font-medium">
            © 2026 AgroRecommend · College Mini Project
          </p>
        </div>
      </footer>
    </div>
  );
}
