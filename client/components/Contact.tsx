'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiGithub, FiSend, FiCheckCircle } from 'react-icons/fi'
import { toast } from '@/lib/toast'
import { useLanguage } from '@/lib/LanguageContext'

export default function Contact() {
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [emailDelivered, setEmailDelivered] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (response.ok) {
        setIsSubmitted(true)
        setEmailDelivered(!!result.emailSent)
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        throw new Error(result.message || '메시지 전송에 실패했습니다.')
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error)
      toast.error('메시지 전송에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactItems = [
    { label: 'Email', value: 'c8c8c81828@gmail.com', href: 'mailto:c8c8c81828@gmail.com' },
    { label: 'Phone', value: '050-6679-1577', href: 'tel:+8205066791577' },
    { label: 'Location', value: t.contact.location, href: null },
    { label: 'Hours', value: t.contact.hours, href: null },
  ]

  return (
    <section
      id="contact"
      className="relative overflow-hidden py-32"
      style={{
        background: 'linear-gradient(180deg, #0a1628 0%, #0d1f3c 40%, #0f172a 100%)',
      }}
    >
      {/* Horizon glow — sunset-over-sea feeling */}
      <div
        className="absolute inset-x-0 top-0 h-[500px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56,189,248,0.09) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-64 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 110%, rgba(52,211,153,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Top hairline */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />

      <div className="container-custom relative z-10">

        {/* ── Hero typography ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85 }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-px bg-cyan-400/80" />
            <span className="text-cyan-400 text-xs font-mono tracking-[0.2em] uppercase">
              {t.contact.label}
            </span>
          </div>

          <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-black text-white leading-[1.0] mb-8">
            {t.contact.heading1}<br />
            <span
              style={{
                background: 'linear-gradient(90deg, #22d3ee, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t.contact.heading2}
            </span>
          </h2>

          {/* Big email link */}
          <a href="mailto:c8c8c81828@gmail.com" className="group inline-block">
            <p className="text-lg md:text-xl text-white/40 font-mono group-hover:text-cyan-300 transition-colors duration-300 mb-1.5">
              c8c8c81828@gmail.com
            </p>
            <div className="h-px w-full bg-gradient-to-r from-cyan-400/40 to-transparent group-hover:from-cyan-400/80 transition-all duration-300" />
          </a>
        </motion.div>

        {/* ── Two columns: info + form ─────────────── */}
        <div className="grid lg:grid-cols-2 gap-16 max-w-5xl">

          {/* Left: info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-white/45 text-lg leading-relaxed mb-10 whitespace-pre-line">
              {t.contact.intro}
            </p>

            <div className="space-y-5 mb-10">
              {contactItems.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="text-white/22 text-xs font-mono w-16 shrink-0">{item.label}</span>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-white/55 hover:text-cyan-300 transition-colors duration-300 text-sm"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="text-white/55 text-sm">{item.value}</span>
                  )}
                </div>
              ))}
            </div>

            <a
              href="https://github.com/oikikomori/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/12 text-white/40 hover:border-cyan-400/40 hover:text-cyan-300 transition-all duration-300 text-sm"
            >
              <FiGithub size={15} />
              GitHub
            </a>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FiCheckCircle className="text-emerald-400 mb-4" size={38} />
                <h4 className="text-xl font-semibold text-white mb-2">{t.contact.successTitle}</h4>
                <p className="text-white/40 mb-4 text-sm">{t.contact.successDesc}</p>
                {!emailDelivered && (
                  <p className="text-amber-400/70 text-xs mb-4 px-4 py-2 rounded-lg border border-amber-400/20 bg-amber-400/5">
                    {t.contact.emailWarning}
                  </p>
                )}
                <button
                  onClick={() => { setIsSubmitted(false); setEmailDelivered(false) }}
                  className="px-6 py-2.5 rounded-full border border-white/15 text-white/50 hover:border-cyan-400/40 hover:text-cyan-300 transition-all duration-300 text-sm"
                >
                  {t.contact.newMessage}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder={t.contact.namePlaceholder}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-all duration-300"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(34,211,238,0.45)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder={t.contact.emailPlaceholder}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-all duration-300"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(34,211,238,0.45)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  />
                </div>

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder={t.contact.subjectPlaceholder}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(34,211,238,0.45)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                />

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  placeholder={t.contact.messagePlaceholder}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-all duration-300 resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(34,211,238,0.45)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-slate-900 flex items-center justify-center gap-2 transition-opacity duration-300 disabled:opacity-50 hover:opacity-90"
                  style={{ background: 'linear-gradient(90deg, #22d3ee, #34d399)' }}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin" />
                  ) : (
                    <>
                      <FiSend size={14} />
                      {t.contact.send}
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
