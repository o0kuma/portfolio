'use client'

import { FiUser, FiCode, FiHeart, FiTarget } from 'react-icons/fi'

export default function About() {
  const features = [
    {
      icon: FiUser,
      title: '퍼블리싱 전문가',
      description: 'HTML/CSS, JavaScript, jQuery, Bootstrap 등 예전 기술과 템플릿을 통한 페이지 구현, 다양한 UI 컴포넌트 구현에 익숙합니다.'
    },
    {
      icon: FiCode,
      title: '모던 프론트엔드',
      description: 'Next.js, Svelte, React, Web Components를 활용한 반응형 UI 및 상태 기반 인터랙션 구현에 능숙합니다.'
    },
    {
      icon: FiHeart,
      title: '6년 8개월 경험',
      description: '웹퍼블리셔와 프론트엔드 개발자로서 다양한 프로젝트를 성공적으로 완료했습니다.'
    },
    {
      icon: FiTarget,
      title: '사용자 중심 설계',
      description: '사용자 경험을 최우선으로 생각하며 깔끔하고 직관적인 인터페이스를 구현합니다.'
    }
  ]

  return (
    <section id="about" className="section-padding bg-canvas">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">저에 대해</span> 알아보세요
          </h2>
          <p className="text-lg text-textMuted max-w-2xl mx-auto">
            프론트엔드 개발자로 화면 구성과 화면에 필요한 데이터 작업을 진행합니다.
            HTML5, CSS3, JavaScript부터 Next.js, Svelte, React까지 다양한 기술을 활용한 프로젝트 경험을 보유하고 있습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative">
            {/* 프로필 이미지 */}
            <div className="mb-8 flex justify-center md:justify-start">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                <img 
                  src="/images/profile.svg" 
                  alt="오승일 프로필"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              안녕하세요, 저는 <span className="text-gradient">오승일</span>입니다
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              퍼블리싱은 누구보다 자신 있습니다. HTML/CSS는 물론, JavaScript와 Web Component, 
              (jQuery, Bootstrap) 등 예전 기술과 템플릿을 통한 페이지 구현현 다양한 UI 컴포넌트 구현에 익숙합니다. 최근에는 Next.js, Svelte와 React도 
              활용하며, 반응형 UI 및 상태 기반 인터랙션 구현에도 능숙합니다.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              6년 8개월의 개발 경험을 바탕으로 웹퍼블리셔와 프론트엔드 개발자로서 다양한 프로젝트를 
              성공적으로 완료했습니다. 사용자 경험을 최우선으로 생각하며, 깔끔하고 직관적인 인터페이스를 
              구현하는 것을 목표로 합니다.
            </p>
            
            {/* 개인 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">이름</div>
                <div className="font-semibold">오승일</div>
              </div>
              <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">경력</div>
                <div className="font-semibold">6년 8개월</div>
              </div>
              <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">직함</div>
                <div className="font-semibold">웹퍼블리셔/프론트엔드 개발자</div>
              </div>
              <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">생년</div>
                <div className="font-semibold">1990년생</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start space-x-4 p-6 bg-surface/80 dark:bg-surfaceElevated/40 rounded-xl border border-border hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="text-primary-600 dark:text-primary-400" size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            기술 스택
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* 프론트엔드 기술 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-4">프론트엔드</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">React</span>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">70%</span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '70%'}}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Next.js</span>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">70%</span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '70%'}}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">TypeScript</span>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">85%</span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
            </div>

            {/* 스타일링 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-4">스타일링</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700 dark:text-purple-300">Tailwind CSS</span>
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">90%</span>
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '90%'}}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700 dark:text-purple-300">CSS3</span>
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">99%</span>
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '99%'}}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700 dark:text-purple-300">SCSS</span>
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">80%</span>
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '80%'}}></div>
                </div>
              </div>
            </div>

            {/* 상태 관리 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-4">상태 관리</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700 dark:text-green-300">Redmine</span>
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">85%</span>
                </div>
                <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700 dark:text-green-300">Confluence</span>
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">80%</span>
                </div>
                <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '80%'}}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700 dark:text-green-300">Jira</span>
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">80%</span>
                </div>
                <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '80%'}}></div>
                </div>
              </div>
            </div>

            {/* 도구 */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl">
              <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-4">도구</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-700 dark:text-orange-300">Git</span>
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">90%</span>
                </div>
                <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{width: '90%'}}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-700 dark:text-orange-300">Webpack</span>
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">75%</span>
                </div>
                <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-700 dark:text-orange-300">Vite</span>
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">85%</span>
                </div>
                <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            항상 새로운 프론트엔드 기술을 배우고 적용하는 것에 대한 열정을 가지고 있으며, 
            사용자에게 최고의 경험을 제공하는 것이 제 목표입니다.
          </p>
          <a
            href="#contact"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>함께 일하고 싶으시다면 연락주세요</span>
            <FiTarget size={20} />
          </a>
        </div>
      </div>
    </section>
  )
}
