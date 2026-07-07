'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  {
    title: '타워 배치',
    titleEn: 'Place Towers',
    body: '하단 버튼으로 타워를 선택하고, 경로 옆 빈 칸을 탭/클릭해서 설치하세요.',
    bodyEn: 'Select a tower from the bottom bar, then tap/click an empty tile beside the path.',
    highlight: 'build',
  },
  {
    title: '타워 업그레이드',
    titleEn: 'Upgrade Towers',
    body: '설치된 타워를 클릭하면 업그레이드·판매 패널이 나옵니다. Lv.3이 되면 진화 기회가 생깁니다.',
    bodyEn: 'Click a placed tower to upgrade or sell it. At level 3, evolution becomes available.',
    highlight: 'upgrade',
  },
  {
    title: '타워 진화 (합성)',
    titleEn: 'Tower Evolution',
    body: '같은 타워 2개가 인접하면 강력한 진화 타워로 합칠 수 있어요. 시너지 힌트를 확인하세요!',
    bodyEn: 'Two adjacent towers of the right combo can evolve into a powerful new tower. Check synergy hints!',
    highlight: 'evolve',
  },
  {
    title: '웨이브 시작',
    titleEn: 'Start Waves',
    body: '준비가 되면 [다음 웨이브] 버튼을 누르세요. AUTO를 켜면 자동으로 시작됩니다.',
    bodyEn: 'Press [Next Wave] when ready. Enable AUTO to start waves automatically.',
    highlight: 'wave',
  },
  {
    title: '👻 유령 & 💚 재생',
    titleEn: '👻 Ghost & 💚 Regen',
    body: '유령은 냉기 계열 타워만 피해를 줄 수 있어요. 재생 적은 체력이 계속 회복됩니다. 빠르게 처치하세요!',
    bodyEn: 'Ghosts can only be hurt by frost-type towers. Regen enemies heal over time — kill them fast!',
    highlight: 'enemy',
  },
] as const

const STORAGE_KEY = 'td_tutorial_done'

type Props = { locale: string; onDone: () => void }

export default function TowerDefenseTutorial({ locale, onDone }: Props) {
  const [step, setStep] = useState(0)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const handleDone = () => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, '1')
    onDone()
  }

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center pb-32 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-auto mx-4 w-full max-w-sm rounded-2xl border border-cyan-400/30 bg-slate-900/95 p-5 shadow-[0_0_32px_rgba(34,211,238,0.15)] backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest">
              Tutorial {step + 1} / {STEPS.length}
            </span>
            <button
              type="button"
              onClick={handleDone}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {locale === 'ko' ? '건너뛰기' : 'Skip'}
            </button>
          </div>

          <h3 className="text-sm font-bold text-white mb-2">
            {locale === 'ko' ? current.title : current.titleEn}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            {locale === 'ko' ? current.body : current.bodyEn}
          </p>

          {/* Step dots */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === step ? 'w-6 bg-cyan-400' : i < step ? 'w-2 bg-cyan-400/40' : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={isLast ? handleDone : () => setStep(s => s + 1)}
              className="rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
            >
              {isLast
                ? (locale === 'ko' ? '시작하기 🚀' : 'Start 🚀')
                : (locale === 'ko' ? '다음 →' : 'Next →')}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function shouldShowTutorial(): boolean {
  if (typeof window === 'undefined') return false
  return !localStorage.getItem(STORAGE_KEY)
}
