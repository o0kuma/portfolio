'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiGithub, FiSend, FiCheckCircle } from 'react-icons/fi'
import { toast } from '@/lib/toast'
import { useLanguage } from '@/lib/LanguageContext'
import { portfolioViewport, sectionReveal, maskReveal, lineReveal, staggerContainer, staggerItem } from '@/lib/portfolioMotion'

const inputClass =
  'w-full px-4 py-3 rounded-lg text-sm text-neutral-100 placeholder-neutral-600 bg-neutral-900 border border-neutral-800 focus:outline-none focus:border-neutral-500 transition-colors'

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
    <section id="contact" className="relative py-32 border-b border-neutral-800 bg-neutral-900">
      <div className="container-custom relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={portfolioViewport}
          className="mb-16 max-w-3xl"
        >
          <motion.div variants={staggerItem} className="flex items-center gap-3 mb-8">
            <div className="overflow-hidden w-8 h-px">
              <motion.span
                variants={lineReveal}
                className="block w-full h-full bg-neutral-600"
                style={{ originX: 0 }}
              />
            </div>
            <span className="text-neutral-500 text-xs font-mono tracking-[0.2em] uppercase">
              {t.contact.label}
            </span>
          </motion.div>

          <div className="overflow-hidden mb-6">
            <motion.h2 variants={maskReveal} className="text-4xl md:text-5xl font-black text-neutral-50 leading-tight">
              {t.contact.heading1}
              <br />
              <span className="text-neutral-400">{t.contact.heading2}</span>
            </motion.h2>
          </div>

          <a href="mailto:c8c8c81828@gmail.com" className="group inline-block">
            <p className="text-base md:text-lg text-neutral-500 font-mono group-hover:text-neutral-200 transition-colors">
              c8c8c81828@gmail.com
            </p>
            <div className="h-px w-full bg-neutral-800 group-hover:bg-neutral-600 transition-colors mt-1" />
          </a>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-5xl">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={portfolioViewport}
          >
            <p className="text-neutral-500 text-lg leading-relaxed mb-10 whitespace-pre-line">
              {t.contact.intro}
            </p>

            <div className="space-y-4 mb-10">
              {contactItems.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="text-neutral-600 text-xs font-mono w-16 shrink-0">{item.label}</span>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-neutral-400 hover:text-neutral-100 transition-colors text-sm"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="text-neutral-400 text-sm">{item.value}</span>
                  )}
                </div>
              ))}
            </div>

            <a
              href="https://github.com/oikikomori/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 transition-colors text-sm"
            >
              <FiGithub size={15} />
              GitHub
            </a>
          </motion.div>

          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={portfolioViewport}
            transition={{ delay: 0.1 }}
          >
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-neutral-800 rounded-xl bg-neutral-950/50">
                <FiCheckCircle className="text-neutral-300 mb-4" size={36} />
                <h4 className="text-lg font-semibold text-neutral-100 mb-2">{t.contact.successTitle}</h4>
                <p className="text-neutral-500 mb-4 text-sm">{t.contact.successDesc}</p>
                {!emailDelivered && (
                  <p className="text-neutral-500 text-xs mb-4 px-4 py-2 rounded border border-neutral-700">
                    {t.contact.emailWarning}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmailDelivered(false)
                  }}
                  className="px-5 py-2 rounded-lg border border-neutral-700 text-neutral-400 hover:text-neutral-200 text-sm transition-colors"
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
                    className={inputClass}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder={t.contact.emailPlaceholder}
                    className={inputClass}
                  />
                </div>

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder={t.contact.subjectPlaceholder}
                  className={inputClass}
                />

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  placeholder={t.contact.messagePlaceholder}
                  className={`${inputClass} resize-none`}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-neutral-950 bg-neutral-100 hover:bg-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 rounded-full border-2 border-neutral-400 border-t-neutral-900 animate-spin" />
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
