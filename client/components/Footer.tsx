'use client'

import { FiGithub, FiMail, FiArrowUp } from 'react-icons/fi'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: FiGithub, href: 'https://github.com', label: 'GitHub' },
    { icon: FiMail, href: 'mailto:c8c8c81828@gmail.com', label: 'Email' },
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-slate-900 text-white dark:bg-canvas dark:border-t dark:border-border">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950 dark:from-canvas dark:via-surfaceElevated/30 dark:to-canvas" />

      <div className="container-custom relative z-10">
        <div className="py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div>
                <h3 className="text-2xl font-display font-bold text-gradient mb-4">Portfolio</h3>
                <p className="text-gray-300 dark:text-textMuted mb-6 max-w-md">
                  창의적인 웹 솔루션을 만들어내는 프론트엔드 개발자입니다.
                  사용자 경험을 중시하며, 최신 기술 트렌드를 활용한 프로젝트를 진행합니다.
                </p>

                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-dark-800 dark:bg-surfaceElevated rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-primary-600 transition-all duration-200 hover:-translate-y-0.5"
                      aria-label={social.label}
                    >
                      <social.icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { name: 'Home', href: '#home' },
                  { name: 'About', href: '#about' },
                  { name: 'Skills', href: '#skills' },
                  { name: 'Projects', href: '#projects' },
                  { name: 'Posts', href: '#posts' },
                  { name: 'Contact', href: '#contact' },
                ].map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-300 dark:text-textMuted hover:text-white transition-colors duration-200">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-300 dark:text-textMuted">
                <li>c8c8c81828@gmail.com</li>
                <li>+82 050-6679-1577</li>
                <li>송파구 사람</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-700 dark:border-border" />

        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 dark:text-textMuted text-sm mb-4 md:mb-0">
              © {currentYear} Portfolio. All rights reserved.
            </p>

            <div className="flex items-center space-x-6 text-sm text-gray-400 dark:text-textMuted">
              <a href="/privacy" className="hover:text-white dark:hover:text-textPrimary transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-white dark:hover:text-textPrimary transition-colors duration-200">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        className="fixed bottom-8 right-8 w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 hover:scale-105 active:scale-95"
        aria-label="상단으로 이동"
      >
        <FiArrowUp size={20} />
      </button>
    </footer>
  )
}
