'use client'

import { motion } from 'framer-motion'
import { FiGithub, FiMail, FiArrowUp, FiBook, FiCode, FiUser } from 'react-icons/fi'
import Link from 'next/link'

export default function BlogFooter() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: FiGithub, href: 'https://github.com', label: 'GitHub' },
    { icon: FiMail, href: 'mailto:c8c8c81828@gmail.com', label: 'Email' }
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container-custom relative z-10">
        {/* 메인 푸터 콘텐츠 */}
        <div className="py-20">
          <div className="grid md:grid-cols-3 gap-12">
            {/* 브랜드 정보 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="md:col-span-1"
            >
              <Link href="/">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                  iykyk blog
                </h3>
              </Link>
              <p className="text-gray-300 mb-6 leading-relaxed">
                A space for sharing thoughts, experiences, and insights 
                across various topics and interests.
              </p>
              
              {/* 소셜 링크 */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -3, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-500 transition-all duration-300 border border-white/10 hover:border-white/30"
                    aria-label={social.label}
                  >
                    <social.icon size={22} />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* 빠른 링크 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <FiBook size={20} className="text-purple-400" />
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'Posts', href: '/posts' },
                  { name: 'Portfolio', href: '/portfolio' },
                  { name: 'Privacy Policy', href: '/privacy' },
                  { name: 'Terms of Service', href: '/terms' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* 카테고리 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <FiCode size={20} className="text-blue-400" />
                Categories
              </h4>
              <ul className="space-y-3">
                {[
                  { name: 'Tech', href: '/posts?category=tech' },
                  { name: 'Lifestyle', href: '/posts?category=lifestyle' },
                  { name: 'Travel', href: '/posts?category=travel' },
                  { name: 'Food', href: '/posts?category=food' },
                  { name: 'Culture', href: '/posts?category=culture' },
                  { name: 'General', href: '/posts?category=general' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-white/10"></div>

        {/* 하단 푸터 */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-gray-400 text-sm"
            >
              © {currentYear} iykyk blog. Made with <span className="text-red-400">❤</span> by Okuma
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-sm text-gray-400"
            >
              <FiUser size={16} />
              <span>Personal Blog</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 상단으로 이동 버튼 */}
      <motion.button
        onClick={scrollToTop}
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.3 }}
        viewport={{ once: true }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 z-40 flex items-center justify-center backdrop-blur-sm border border-white/20"
        aria-label="Scroll to top"
      >
        <FiArrowUp size={22} />
      </motion.button>
    </footer>
  )
}

