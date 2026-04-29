'use client'

import { FiCode, FiDatabase, FiServer, FiSmartphone, FiCloud } from 'react-icons/fi'

export default function Skills() {
  const skillCategories = [
    {
      icon: FiCode,
      title: '프론트엔드',
      color: 'from-blue-500 to-cyan-500',
      skills: [
        { name: 'HTML5', level: 95 },
        { name: 'CSS3', level: 95 },
        { name: 'JavaScript', level: 90 },
        { name: 'React', level: 80 },
        { name: 'Svelte', level: 85 },
        { name: 'Web Components', level: 95 }
      ]
    },
    {
      icon: FiServer,
      title: '백엔드 & 기타',
      color: 'from-green-500 to-emerald-500',
      skills: [
        { name: 'Node.js', level: 70 },
        { name: 'PHP', level: 60 },
        { name: 'Go', level: 50 },
        { name: 'EJS', level: 70 },
        { name: 'PixiJS', level: 60 },
        { name: 'Semantic UI', level: 80 }
      ]
    },
    {
      icon: FiDatabase,
      title: '데이터베이스',
      color: 'from-purple-500 to-pink-500',
      skills: [
        { name: 'MySQL', level: 80 },
        { name: 'MongoDB', level: 40 },
      ]
    },
    {
      icon: FiCloud,
      title: '개발 도구',
      color: 'from-orange-500 to-red-500',
      skills: [
        { name: 'Git', level: 90 },
        { name: 'GitHub', level: 90 },
        { name: 'GitLab', level: 80 },
        { name: 'Figma', level: 85 },
        { name: 'Zeplin', level: 80 },
        { name: 'Adobe Photoshop', level: 70 }
      ]
    },
    {
      icon: FiSmartphone,
      title: '프레임워크 & 라이브러리',
      color: 'from-indigo-500 to-purple-500',
      skills: [
        { name: 'Next.js', level: 75 },
        { name: 'SCSS', level: 80 },
        { name: 'Web Components', level: 95 },
        { name: 'PixiJS', level: 70 },
        { name: 'jQuery', level: 90 },
        { name: 'Bootstrap', level: 85 },
        { name: 'Semantic UI', level: 80 }
      ]
    }
  ]

  return (
    <section id="skills" className="section-padding bg-surface/50 dark:bg-canvas">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">기술 스택</span>을 소개합니다
          </h2>
          <p className="text-lg text-textMuted max-w-2xl mx-auto">
            퍼블리싱은 누구보다 자신 있습니다. HTML/CSS는 물론, JavaScript와 Web Component, 
            jQuery, Bootstrap 등 다양한 UI 컴포넌트 구현에 익숙합니다. 최근에는 Svelte와 React도 
            활용하며, 반응형 UI 및 상태 기반 인터랙션 구현에도 능숙합니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {skillCategories.map((category) => (
            <div key={category.title} className="card p-6">
              {/* 카테고리 헤더 */}
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center mr-4`}>
                  <category.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {category.title}
                </h3>
              </div>

              {/* 스킬 리스트 */}
              <div className="space-y-4">
                {category.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {skill.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                      <div
                        className={`h-2 bg-gradient-to-r ${category.color} rounded-full`}
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-white dark:bg-dark-900 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              지속적인 학습과 성장
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
              기술의 발전 속도가 빠른 IT 업계에서 항상 최신 트렌드를 파악하고 학습하고 있습니다. 
              새로운 프레임워크나 라이브러리를 빠르게 습득하여 프로젝트에 적용하는 것에 익숙하며, 
              코드 품질과 성능 최적화에 대한 지속적인 개선을 추구합니다.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="px-3 py-1 bg-gray-100 dark:bg-dark-800 rounded-full">Agile/Scrum</span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-dark-800 rounded-full">TDD</span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-dark-800 rounded-full">Clean Code</span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-dark-800 rounded-full">Microservices</span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-dark-800 rounded-full">API Design</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
