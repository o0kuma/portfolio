'use client'

import { motion } from 'framer-motion'
import { FiArrowDown, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'

export default function Hero() {
  const socialLinks = [
    {
      icon: FiGithub,
      href: 'https://github.com/oikikomori/',
      label: 'GitHub'
    },
    // {
    //   icon: FiLinkedin,
    //   href: 'https://linkedin.com/in/yourusername',
    //   label: 'LinkedIn'
    // },
    {
      icon: FiMail,
      href: 'mailto:c8c8c81828@gmail.com',
      label: 'Email'
    }
  ]

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 강렬한 그라데이션 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-slate-950 dark:via-purple-950 dark:to-indigo-950"></div>
      
      {/* 애니메이션 그리드 패턴 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* 강렬한 플로팅 요소들 */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 150, 0],
            y: [0, -150, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full opacity-40 blur-3xl shadow-2xl shadow-purple-500/50"
        />
        <motion.div
          animate={{
            x: [0, -120, 0],
            y: [0, 120, 0],
            rotate: [360, 180, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-full opacity-40 blur-3xl shadow-2xl shadow-blue-500/50"
        />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, -180, -360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-40 left-1/4 w-36 h-36 bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500 rounded-full opacity-40 blur-3xl shadow-2xl shadow-orange-500/50"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.15, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 right-1/3 w-28 h-28 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full opacity-35 blur-3xl shadow-2xl shadow-violet-500/50"
        />
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="container-custom text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* 강렬한 인사말 */}
          <motion.h1
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 100 }}
            className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-8 leading-tight"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 80px rgba(102, 126, 234, 0.5)',
              filter: 'drop-shadow(0 0 30px rgba(102, 126, 234, 0.8))'
            }}
          >
            안녕하세요! 👋
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-12 max-w-4xl mx-auto text-white drop-shadow-2xl"
          >
            프론트엔드 개발자{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent font-black">
                오승일
              </span>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 blur-xl opacity-50"
              />
            </span>
            입니다.
            <br />
            <span className="text-xl md:text-2xl lg:text-3xl font-semibold text-blue-200 dark:text-blue-300 mt-4 block">
              퍼블리싱부터 Next.js, Svelte, React까지
              <br />
              <span className="text-yellow-300 dark:text-yellow-400">다양한 기술을 활용 가능 ⭐</span>
            </span>
          </motion.p>

          {/* 강렬한 CTA 버튼들 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.1, y: -5, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              className="relative group bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white text-xl px-10 py-5 rounded-2xl inline-flex items-center justify-center font-black shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                프로젝트 보기
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
              <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.a>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.1, y: -5, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
              className="relative group border-4 border-white/30 backdrop-blur-xl bg-white/10 text-white text-xl px-10 py-5 rounded-2xl inline-flex items-center justify-center font-black shadow-2xl hover:shadow-white/30 hover:bg-white/20 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                연락하기
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✉️
                </motion.span>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
            </motion.a>
          </motion.div>

          {/* 강렬한 소셜 링크 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex justify-center space-x-8 mb-16"
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.3, y: -5, rotate: 360 }}
                whileTap={{ scale: 0.9 }}
                className="relative group text-white p-4 rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50"
                title={social.label}
              >
                <social.icon size={28} className="relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-white/30 rounded-2xl blur-xl"
                />
              </motion.a>
            ))}
          </motion.div>

          {/* 스크롤 안내 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <FiArrowDown size={20} />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
