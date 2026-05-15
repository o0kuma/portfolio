'use client'

import { motion } from 'framer-motion'

export default function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden py-32"
      style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0a1e38 100%)' }}
    >
      {/* Subtle wave background texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,200 C240,100 480,300 720,200 C960,100 1200,300 1440,200 L1440,400 L0,400 Z" fill="#22d3ee" />
          <path d="M0,240 C360,150 720,320 1080,230 C1260,185 1380,255 1440,240 L1440,400 L0,400 Z" fill="#38bdf8" />
        </svg>
      </div>

      {/* Top hairline */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-[1fr_120px] gap-12 lg:gap-20 items-start max-w-5xl">

          {/* ── Left: Content ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85 }}
          >
            {/* Section label */}
            <div className="flex items-center gap-3 mb-12">
              <span className="w-8 h-px bg-cyan-400/80" />
              <span className="text-cyan-400 text-xs font-mono tracking-[0.2em] uppercase">About</span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-10">
              화면을 만드는<br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #22d3ee, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                사람입니다.
              </span>
            </h2>

            {/* Natural monologue */}
            <div className="space-y-5 text-white/55 text-[1.05rem] leading-[1.85] max-w-2xl">
              <p>
                웹퍼블리셔로 시작해 지금은 프론트엔드 개발자로 일하고 있습니다.
                HTML과 CSS를 다루는 것을 가장 좋아하고,
                화면이 딱 맞아떨어질 때의 그 감각을 즐깁니다.
              </p>
              <p>
                {new Date().getFullYear() - 2019}년 동안 금융 플랫폼, 트레이딩 시스템, 앱 서비스, 회사 사이트 등
                다양한 프로젝트를 거쳐왔습니다. 요즘은 Next.js와 Svelte를 주로 쓰고 있고,
                TypeScript로 더 단단한 코드를 만드는 데 집중합니다.
              </p>
              <p>
                퍼블리싱 감각과 개발 실력 모두를 갖추려 꾸준히 배우고 있습니다.
              </p>
            </div>

            {/* Recent work items */}
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-5 h-px bg-cyan-400/60" />
                <span className="text-cyan-400/70 text-xs font-mono tracking-[0.18em] uppercase">Recent Work</span>
              </div>
              <ul className="space-y-3">
                {[
                  { label: 'BTB 사이트 유지보수 / Scale-up', status: '' },
                  { label: 'scaleup_tip 논문·특허 데이터 수집 — JSON 메타데이터 추출 및 서버 저장 관리', status: '' },
                  { label: 'B2B 오픈마켓', status: '진행 중' },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="mt-[0.55rem] w-1 h-1 rounded-full bg-cyan-400/40 shrink-0" />
                    <span className="text-white/45 text-sm leading-relaxed">
                      {item.label}
                      {item.status && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-[0.65rem] font-mono border border-cyan-400/25 text-cyan-400/60 bg-cyan-400/[0.06] align-middle">
                          {item.status}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Inline stats */}
            <div className="mt-12 flex flex-wrap gap-10">
              {[
                { value: `${new Date().getFullYear() - 2019}+`, label: '년 경력' },
                { value: '15+', label: '프로젝트' },
                { value: '1990', label: '년생' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-3xl font-black"
                    style={{
                      background: 'linear-gradient(90deg, #22d3ee, #34d399)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-white/35 text-sm mt-1 font-mono">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Info chips */}
            <div className="mt-10 flex flex-wrap gap-2.5">
              {[
                '서울 · 송파구',
                '웹퍼블리셔 / 프론트엔드 개발자',
                'c8c8c81828@gmail.com',
              ].map((item) => (
                <span
                  key={item}
                  className="px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/40 text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Large vertical typography accent ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:flex items-center justify-center pt-4"
            aria-hidden="true"
          >
            <div
              className="text-[7rem] font-black leading-none tracking-tighter select-none"
              style={{
                background: 'linear-gradient(180deg, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0.04) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
              }}
            >
              OSI
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
