'use client'

import { useState } from 'react'
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const contactInfo = [
    {
      icon: FiMail,
      title: 'E-mail',
      value: 'c8c8c81828@gmail.com',
      link: 'mailto:c8c8c81828@gmail.com'
    },
    {
      icon: FiPhone,
      title: 'Phone Number',
      value: '+82 050-6679-1577',
      link: 'tel:+82 050-6679-1577'
    },
    {
      icon: FiMapPin,
      title: 'Location',
      value: '송파구 사람',
      link: null
    }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({ name: '', email: '', subject: '', message: '' })
        
        // 메일 전송 성공/실패에 따른 알림
        if (result.emailSent) {
          console.log('✅ 메시지와 메일이 성공적으로 전송되었습니다.')
        } else if (result.emailError) {
          // 이메일 전송 실패는 경고로만 표시 (메시지는 성공적으로 저장됨)
          console.warn('⚠️ 메시지는 저장되었지만 메일 전송에 실패했습니다:', result.emailError)
          // 사용자에게는 성공 메시지만 표시 (이메일 실패는 개발자 콘솔에만 표시)
        }
      } else {
        throw new Error(result.message || '메시지 전송에 실패했습니다.')
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error)
      alert('메시지 전송에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="section-padding bg-canvas">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">연락</span>해 주세요
          </h2>
          <p className="text-lg text-textMuted max-w-2xl mx-auto">
            프로젝트 협업이나 궁금한 점이 있으시다면 언제든 연락주세요.
            빠른 시일 내에 답변드리도록 하겠습니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">
              Contact Information
            </h3>
            
            <div className="space-y-6">
              {contactInfo.map((info) => (
                <div key={info.title} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <info.icon className="text-primary-600 dark:text-primary-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">
                      {info.title}
                    </h4>
                    {info.link ? (
                      <a
                        href={info.link}
                        className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">
                        {info.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 추가 정보 */}
            <div className="mt-12 p-6 bg-gray-50 dark:bg-dark-800 rounded-xl">
              <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                Business Hours
              </h4>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Weekdays: 9:00 AM – 6:00 PM</p>
                <p>Weekends: 1:00 PM – 2:00 PM (open for limited service)</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  * 긴급한 문의사항은 언제든 연락주세요 (주말 빼고)
                </p>
              </div>
            </div>

            {/* 소셜 링크 */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                소셜 미디어
              </h4>
              <div className="flex space-x-4">
                {[
                  { name: 'GitHub', href: 'https://github.com', color: 'bg-gray-800 hover:bg-gray-900' },
                  // { name: 'LinkedIn', href: 'https://linkedin.com', color: 'bg-blue-600 hover:bg-blue-700' },
                  // { name: 'Twitter', href: 'https://twitter.com', color: 'bg-sky-500 hover:bg-sky-600' }
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${social.color} text-white px-4 py-2 rounded-lg transition-colors duration-200`}
                  >
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">
              Send Message
            </h3>

            {isSubmitted ? (
              <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <FiCheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                  메시지가 전송되었습니다!
                </h4>
                <p className="text-green-600 dark:text-green-300 mb-4">
                  빠른 시일 내에 답변드리도록 하겠습니다.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="btn-outline"
                >
                  새 메시지 작성
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Subject"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="input-field resize-none"
                    placeholder="내용을 적어주세요요오오"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3 text-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>전송 중...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <FiSend size={20} />
                      <span>Submit</span>
                    </div>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
