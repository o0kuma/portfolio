'use client'

import { motion } from 'framer-motion'
import { FiGithub, FiMail, FiArrowDown } from 'react-icons/fi'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2744 55%, #0a1e3d 100%)' }}
    >
      {/* Subtle cyan grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,211,238,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.035) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Ambient glow blobs */}
      <div
        className="absolute top-1/3 left-[15%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-[10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)' }}
      />

      {/* Bottom wave fade */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-20">
          <path
            d="M0,50 C360,100 720,10 1080,55 C1260,75 1380,30 1440,50 L1440,100 L0,100 Z"
            fill="rgba(34,211,238,0.06)"
          />
          <path
            d="M0,70 C480,30 960,90 1440,60 L1440,100 L0,100 Z"
            fill="rgba(56,189,248,0.04)"
          />
        </svg>
      </div>

      {/* Main layout */}
      <div className="container-custom relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen py-28">

          {/* ── Left: Text ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-sm font-medium mb-10 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Frontend Developer
            </div>

            {/* Name */}
            <h1 className="font-black leading-[1.0] mb-6">
              <span className="block text-white text-6xl md:text-7xl lg:text-8xl">오승일</span>
              <span
                className="block text-4xl md:text-5xl lg:text-6xl font-bold mt-2"
                style={{
                  background: 'linear-gradient(90deg, #22d3ee 0%, #38bdf8 50%, #34d399 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Seungil Oh
              </span>
            </h1>

            {/* Description */}
            <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-md">
              퍼블리싱부터 React, Next.js, Svelte까지 —<br />
              화면을 만드는 것을 즐기는 {new Date().getFullYear() - 2019}년 차 개발자입니다.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <motion.a
                href="#projects"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-slate-900 font-semibold text-sm shadow-lg"
                style={{
                  background: 'linear-gradient(90deg, #22d3ee, #34d399)',
                  boxShadow: '0 8px 32px rgba(34,211,238,0.25)',
                }}
              >
                프로젝트 보기
              </motion.a>
              <motion.a
                href="#contact"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 text-white/75 font-semibold text-sm backdrop-blur-sm hover:border-cyan-400/50 hover:text-cyan-300 transition-colors duration-300"
              >
                연락하기
              </motion.a>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/oikikomori/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/35 hover:text-cyan-300 transition-colors duration-300 text-sm"
              >
                <FiGithub size={17} />
                <span>GitHub</span>
              </a>
              <a
                href="mailto:c8c8c81828@gmail.com"
                className="flex items-center gap-2 text-white/35 hover:text-cyan-300 transition-colors duration-300 text-sm"
              >
                <FiMail size={17} />
                <span>Email</span>
              </a>
            </div>
          </motion.div>

          {/* ── Right: Ocean SVG visual ─────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, delay: 0.25, ease: 'easeOut' }}
            className="hidden lg:flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="relative w-full max-w-[480px] aspect-square">
              {/* Gentle outer pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full border border-cyan-400/15"
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-8 rounded-full border border-sky-400/10"
                animate={{ scale: [1, 1.03, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />

              <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <radialGradient id="heroCenter" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Concentric depth rings */}
                <circle cx="250" cy="250" r="230" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.12" />
                <circle cx="250" cy="250" r="190" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.16" />
                <circle cx="250" cy="250" r="150" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.18" />
                <circle cx="250" cy="250" r="110" stroke="#34d399" strokeWidth="0.8" strokeOpacity="0.2" />
                <circle cx="250" cy="250" r="72" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.25" />

                {/* Wave paths */}
                <path
                  d="M20,248 C80,220 140,278 200,250 C260,222 320,278 380,250 C420,232 450,258 480,248"
                  stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" fill="none"
                />
                <path
                  d="M20,268 C90,245 150,295 215,268 C280,241 340,295 400,268 C435,254 460,275 480,265"
                  stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.3" strokeLinecap="round" fill="none"
                />
                <path
                  d="M20,228 C70,212 130,252 190,228 C250,204 305,250 360,228 C400,212 448,235 480,225"
                  stroke="#34d399" strokeWidth="1" strokeOpacity="0.25" strokeLinecap="round" fill="none"
                />

                {/* Central glow */}
                <circle cx="250" cy="250" r="55" fill="url(#heroCenter)" />
                <circle cx="250" cy="250" r="12" fill="#22d3ee" fillOpacity="0.7" />
                <circle cx="250" cy="250" r="5" fill="url(#heroGlow)" />

                {/* Floating constellation dots */}
                <circle cx="108" cy="138" r="3.5" fill="#22d3ee" fillOpacity="0.65" />
                <circle cx="385" cy="118" r="2.5" fill="#34d399" fillOpacity="0.55" />
                <circle cx="408" cy="358" r="4" fill="#38bdf8" fillOpacity="0.5" />
                <circle cx="78" cy="368" r="2.5" fill="#22d3ee" fillOpacity="0.5" />
                <circle cx="345" cy="448" r="3" fill="#34d399" fillOpacity="0.45" />
                <circle cx="148" cy="432" r="2" fill="#38bdf8" fillOpacity="0.6" />
                <circle cx="455" cy="198" r="2.5" fill="#22d3ee" fillOpacity="0.4" />
                <circle cx="60" cy="258" r="2" fill="#34d399" fillOpacity="0.5" />
                <circle cx="440" cy="288" r="2" fill="#38bdf8" fillOpacity="0.45" />

                {/* Connector lines (constellation) */}
                <line x1="108" y1="138" x2="250" y2="250" stroke="#22d3ee" strokeOpacity="0.08" strokeWidth="0.8" />
                <line x1="385" y1="118" x2="250" y2="250" stroke="#34d399" strokeOpacity="0.08" strokeWidth="0.8" />
                <line x1="408" y1="358" x2="250" y2="250" stroke="#38bdf8" strokeOpacity="0.08" strokeWidth="0.8" />
                <line x1="78" y1="368" x2="250" y2="250" stroke="#22d3ee" strokeOpacity="0.08" strokeWidth="0.8" />

                {/* Floating tech labels */}
                <text x="310" y="152" fill="#22d3ee" fillOpacity="0.45" fontSize="11" fontFamily="monospace">Next.js</text>
                <text x="85" y="196" fill="#34d399" fillOpacity="0.4" fontSize="10" fontFamily="monospace">HTML5</text>
                <text x="358" y="315" fill="#38bdf8" fillOpacity="0.5" fontSize="11" fontFamily="monospace">React</text>
                <text x="72" y="312" fill="#22d3ee" fillOpacity="0.4" fontSize="10" fontFamily="monospace">CSS3</text>
                <text x="195" y="430" fill="#34d399" fillOpacity="0.4" fontSize="11" fontFamily="monospace">Svelte</text>
                <text x="175" y="88" fill="#38bdf8" fillOpacity="0.45" fontSize="10" fontFamily="monospace">TypeScript</text>
              </svg>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.button
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-white/25 hover:text-cyan-400 transition-colors duration-300 cursor-pointer"
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="아래로 스크롤"
        >
          <FiArrowDown size={20} />
        </motion.button>
      </motion.div>
    </section>
  )
}
