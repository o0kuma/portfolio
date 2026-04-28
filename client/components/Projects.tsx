'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiGithub, FiExternalLink, FiTag, FiCalendar, FiFolder, FiUser, FiCode } from 'react-icons/fi'
import SearchBar from './SearchBar'

interface Project {
  id: string
  title: string
  description: string
  content: string
  technologies: string[]
  images: string[]
  githubUrl: string
  liveUrl: string
  featured: boolean
  category: string
  startDate: string
  endDate: string
  status: string
  participants?: string
  role?: string
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'web', name: '웹/마켓/스토어' },
    { id: 'mobile', name: '모바일' },
    { id: 'desktop', name: '데스크톱' },
    { id: 'other', name: '기타' }
  ]

  // 실제 프로젝트 데이터 (이력서 기반)
  const sampleProjects: Project[] = [
    {
      id: 'tetris-web',
      title: '테트리스 (웹 데모)',
      description: '브라우저에서 플레이하는 테트리스 — SRS 회전, 홀드, 모바일 제스처',
      content:
        'Next.js와 순수 TypeScript 게임 로직으로 구현했습니다. 7-bag 랜덤, 고스트 블록, 레벨별 중력, 로컬 하이스코어를 지원하며 데스크톱 키보드와 모바일 스와이프·버튼 입력을 모두 제공합니다.',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      images: ['/images/placeholder.svg'],
      githubUrl: '',
      liveUrl: '/tetris',
      featured: true,
      category: 'web',
      startDate: '2026-04-01',
      endDate: '',
      status: 'completed',
      participants: '개인',
      role: '기획·구현'
    },
    {
      id: '1',
      title: '바바옵션',
      description: '이지트로스/ 옵션 관련 브랜드 사이트',
      content: 'Binary Option과 관련된 브랜드 사이트로, Next.js와 Node.js를 활용하여 구축했습니다. 반응형 디자인과 현대적인 UI/UX를 적용하여 사용자 경험을 향상시켰습니다.',
      technologies: ['Next.js', 'Node.js', 'HTML5', 'CSS 3', 'SCSS'],
      images: ['/images/placeholder.svg'],
      githubUrl: '',
      liveUrl: '',//https://www.babaoption.com/en/main
      featured: true,
      category: 'web',
      startDate: '2025-01-01',
      endDate: '2025-03-01',
      status: 'completed',
      participants: '팀 프로젝트(회사)',
      role: '전체 개발 담당'
    },
    {
      id: '2',
      title: 'CRM (입출금 관리 시스템)',
      description: '바바옵션/ 이지트로스/ 옵션 관련 CRM 사이트',
      content: 'Binary Option 플랫폼에 필요한 CRM 사이트로 입출금 관련 업무를 관리합니다. Svelte와 Web Components를 활용하여 모던한 관리자 인터페이스를 구현했습니다.',
      technologies: ['HTML5', 'Svelte', 'Web Components', 'JavaScript', 'Go'],
      images: ['/images/placeholder.svg'],
      githubUrl: '',
      liveUrl: '',//https://www.babaoption.com/userpage/login
      featured: true,
      category: 'web',
      startDate: '2023-03-01',
      endDate: '2024-12-31',
      status: 'in-progress',
      participants: '팀 프로젝트(회사)',
      role: '퍼블리싱 및 프론트엔드 개발'
    },
    {
      id: '3',
      title: '이지트로스 (옵션)',
      description: '코인 또는 통화로 게임을 할 수 있는 WTS',
      content: '옵션을 통해 코인 또는 통화로 게임을 할 수 있는 웹 트레이딩 시스템입니다. PixiJS를 활용한 인터랙티브한 게임 요소와 Svelte를 통한 상태 관리를 구현했습니다.',
      technologies: ['HTML5', 'PixiJS', 'JavaScript'],
      images: ['/images/placeholder.svg'],
      githubUrl: '',
      liveUrl: '',
      featured: true,
      category: 'web',
      startDate: '2021-05-01',
      endDate: '2024-12-31',
      status: 'completed',
      participants: '팀 프로젝트(회사)',
      role: '퍼블리싱 및 프론트엔드 개발'
    },
    {
      id: '4',
      title: '랄라 (Lalla)',
      description: 'AI 기반 유아 성장 도움 앱',
      content: 'AI를 활용하여 유치원이나 부모가 유아를 더 편리하고 효과적으로 양육할 수 있도록 도와주는 웹앱입니다. React를 기반으로 한 반응형 UI와 사용자 친화적인 인터페이스를 구현했습니다.',
      technologies: ['HTML5', 'CSS 3', 'React', 'JavaScript'],
      images: ['/images/placeholder.svg'],
      githubUrl: '',
      liveUrl: 'https://play.google.com/store/apps/details?id=com.lullaapp.android&hl=ko',
      featured: false,
      category: 'mobile',
      startDate: '2022-03-01',
      endDate: '2022-06-01',
      status: 'completed',
      participants: '개인 프로젝트(외주)',
      role: '퍼블리싱 및 프론트엔드 개발'
    },
    {
      id: '4-1',
      title: '티찜 (tzzim)',
      description: '골프 티찜 웹사이트',
      content: '골프 티찜 웹사이트로, 골프 티찜을 소개하고 예약을 할 수 있는 웹사이트입니다. React를 기반으로 한 반응형 UI와 사용자 친화적인 인터페이스를 구현했습니다.',
      technologies: ['HTML5', 'CSS 3', 'React', 'JavaScript'],
      images: ['/images/tzzim.png'],
      githubUrl: '',
      liveUrl: 'https://apkpure.net/kr/%ED%8B%B0%EC%B0%9C/com.mnemosyne.teezzim_op',
      featured: false,
      category: 'mobile',
      startDate: '2022-06-17',
      endDate: '2022-07-29',
      status: 'completed',
      participants: '개인 프로젝트(외주)',
      role: '퍼블리싱 및 프론트엔드 개발'
    },
    {
      id: '5',
      title: 'mytradinginfo/ admin',
      description: '코인 관련 정보 사이트 및 관리자 페이지',
      content: '코인 관련 정보를 제공하는 사이트로, 회사 프로젝트와 관련된 광고 및 고객 모집을 위해 제작되었습니다. 반응형 디자인과 관리자 화면을 개발했습니다.',
      technologies: ['HTML5', 'JavaScript', 'React', 'CSS 3'],
      images: ['/images/placeholder.svg'],
      githubUrl: '',
      liveUrl: 'https://www.mytradinginfo.com/',
      featured: false,
      category: 'web',
      startDate: '2020-11-01',
      endDate: '2021-03-01',
      status: 'completed',
      participants: '팀 프로젝트(회사)',
      role: '퍼블리싱 및 프론트엔드 개발'
    },
    {
      id: '6',
      title: 'mysoftwiz / admin',
      description: '회사 소개 사이트 및 관리자 페이지',
      content: '회사 소개 사이트로 이력서와 문의를 받을 수 있으며, 이를 관리하기 위한 관리자 페이지 작업을 진행했습니다. EJS 템플릿 엔진을 활용한 서버사이드 렌더링을 구현했습니다.',
      technologies: ['HTML5', 'JavaScript', 'EJS'],
      images: ['/images/placeholder.svg'],
      githubUrl: '',
      liveUrl: 'https://www.mysoftwiz.com/',
      featured: false,
      category: 'web',
      startDate: '2021-03-01',
      endDate: '2021-04-01',
      status: 'completed',
      participants: '팀 프로젝트(회사)',
      role: '퍼블리싱 및 프론트엔드 개발'
    },
    {
      id: '7',
      title: 'babaglobal',
      description: 'baba 브랜드 관련 회사 소개 홈페이지',
      content: 'baba 브랜드와 관련된 회사 소개 홈페이지를 사내 프로젝트로 개발했습니다. Semantic UI를 활용한 반응형 페이지 퍼블리싱과 프론트엔드 작업을 담당했습니다.',
      technologies: ['HTML5', 'JavaScript', 'CSS 3', 'Semantic UI'],
      images: ['/images/placeholder.svg'],
      githubUrl: '',
      liveUrl: '',
      featured: false,
      category: 'web',
      startDate: '2020-05-01',
      endDate: '2020-07-01',
      status: 'completed',
      participants: '팀 프로젝트(회사)',
      role: '퍼블리싱 및 프론트엔드 개발'
    },
    {
      id: '8',
      title: '쇼어테크 (Shoretech)',
      description: '수영장 소개 사이트',
      content: '외주를 받아 퍼블리싱 작업만 진행한 수영장 소개 사이트입니다. 깔끔하고 직관적인 디자인으로 수영장의 시설과 서비스를 효과적으로 소개했습니다.',
      technologies: ['HTML5', 'CSS 3', 'JavaScript'],
      images: ['/images/placeholder.svg'],
      githubUrl: '',
      liveUrl: '',
      featured: false,
      category: 'web',
      startDate: '2020-02-01',
      endDate: '2020-02-28',
      status: 'completed',
      participants: '외주 프로젝트',
      role: '퍼블리싱 작업 담당'
    },
    {
      id: '9',
      title: '대진대학교 가족회사',
      description: '대진대학교 가족회사 사이트',
      content: '대진대학교 가족회사를 외주로 받아 퍼블리싱 작업을 진행했습니다. 다른 대학들과 마찬가지로 담당 대학에 대한 가족회사 사이트를 제작했습니다.',
      technologies: ['HTML5', 'CSS 3', 'jQuery'],
      images: ['/images/placeholder.svg'],
      githubUrl: '',
      liveUrl: '',
      featured: false,
      category: 'web',
      startDate: '2020-01-01',
      endDate: '2020-01-31',
      status: 'completed',
      participants: '외주 프로젝트',
      role: '퍼블리싱 작업 담당'
    },
    {
      id: '10',
      title: '대전교통약자이동지원센터터',
      description: '교통약자 이동 지원 센터 사이트',
      content: '교통약자 이동 지원 센터 사이트로 외주를 받아 퍼블리싱 작업을 진행했습니다. 다른 대학들과 마찬가지로 담당 대학에 대한 가족회사 사이트를 제작했습니다.',
      technologies: ['HTML5', 'CSS 3', 'JavaScript'],
      images: ['/images/dj_1.jpg'],
      githubUrl: '',
      liveUrl: 'https://djcall.or.kr/',
      featured: false,
      category: 'web',
      startDate: '2019-11-20',
      endDate: '2019-12-10',
      status: 'completed',
      participants: '외주 프로젝트트',
      role: '전 퍼블리싱 담당'
    },
    {
      id: '11',
      title: '스터디피티 (Study PT)',
      description: '공부 개인 맞춤형 훈련 프로젝트',
      content: '공부 개인 맞춤형 훈련 프로젝트로 외주를 받아 작업하였으며, 두 명이 작업을 진행했습니다. 전 퍼블리싱 작업을 담당하여 학생들에게 공부에 대한 편의를 제공하고자 했던 프로젝트입니다.',
      technologies: ['HTML5', 'CSS 3', 'jQuery'],
      images: ['/images/placeholder.svg'],
      githubUrl: '',
      liveUrl: '',
      featured: false,
      category: 'web',
      startDate: '2019-07-01',
      endDate: '2019-08-01',
      status: 'completed',
      participants: '2명 (외주)',
      role: '전 퍼블리싱 작업 담당'
    },
    {
      id: '12',
      title: 'kmuseum',
      description: '전국 박물관 예약 시스템',
      content: 'kmuseum 프로젝트에 총 두 명이 참여하였고, 전 퍼블리싱을 담당했습니다. 전국 모든 박물관에 공연, 전시, 이벤트 등 예약을 할 수 있는 사이트로 고객들에게 편의를 제공하기 위해 작업했던 프로젝트입니다.',
      technologies: ['HTML5', 'CSS 3', 'PHP'],
      images: ['/images/kmuseum_1.jpg'],
      githubUrl: '',
      liveUrl: '',
      featured: false,
      category: 'web',
      startDate: '2019-04-01',
      endDate: '2019-06-01',
      status: 'completed',
      participants: '2명',
      role: '전 퍼블리싱 담당'
    }
  ]

  useEffect(() => {
    // API에서 프로젝트 데이터 가져오기 (현재는 샘플 데이터 사용)
    // 최신 프로젝트부터 표시하도록 정렬
    const sortedProjects = [...sampleProjects].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
    setProjects(sortedProjects)
    setFilteredProjects(sortedProjects)
    setIsLoading(false)
  }, [])

  // 검색 및 필터링 로직
  useEffect(() => {
    let filtered = projects

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory)
    }

    // 검색어 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.content.toLowerCase().includes(query) ||
        project.technologies.some(tech => tech.toLowerCase().includes(query))
      )
    }

    // 추가 필터들
    if (activeFilters.status && activeFilters.status !== 'all') {
      filtered = filtered.filter(project => project.status === activeFilters.status)
    }

    if (activeFilters.dateRange && activeFilters.dateRange !== 'all') {
      const now = new Date()
      filtered = filtered.filter(project => {
        const startDate = new Date(project.startDate)
        switch (activeFilters.dateRange) {
          case 'this-year':
            return startDate.getFullYear() === now.getFullYear()
          case 'last-year':
            return startDate.getFullYear() === now.getFullYear() - 1
          case 'this-month':
            return startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear()
          case 'last-month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
            return startDate.getMonth() === lastMonth.getMonth() && startDate.getFullYear() === lastMonth.getFullYear()
          default:
            return true
        }
      })
    }

    setFilteredProjects(filtered)
  }, [projects, selectedCategory, searchQuery, activeFilters])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long'
    })
  }

  if (isLoading) {
    return (
      <section id="projects" className="section-padding bg-white dark:bg-dark-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="inline-block">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 border-r-primary-600 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                프로젝트를 불러오는 중...
              </h3>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="projects" className="section-padding bg-white dark:bg-dark-900">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">프로젝트</span>를 소개합니다
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            프론트엔드 개발자로 화면 구성과 화면에 필요한 데이터 작업을 진행했습니다.
            HTML5, CSS3, JavaScript부터 Svelte, React까지 다양한 기술을 활용한 프로젝트들을 소개합니다.
          </p>
        </motion.div>

        {/* 검색 및 필터 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <SearchBar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            placeholder="프로젝트를 검색하세요..."
            filters={activeFilters}
            className="max-w-4xl mx-auto"
          />
        </motion.div>

        {/* 카테고리 필터 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* 검색 결과 표시 */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <p className="text-gray-600 dark:text-gray-400">
              "<span className="font-semibold text-primary-600 dark:text-primary-400">{searchQuery}</span>" 검색 결과: 
              <span className="font-semibold text-gray-800 dark:text-white ml-2">{filteredProjects.length}</span>개
            </p>
          </motion.div>
        )}

        {/* 프로젝트 그리드 */}
        {filteredProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card overflow-hidden group"
              >
                {/* 프로젝트 이미지 */}
                <div className="relative overflow-hidden">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-dark-700 dark:to-dark-600 flex items-center justify-center">
                    <img 
                      src={project.images[0]} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                        if (nextElement) {
                          nextElement.style.display = 'flex'
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-dark-700 dark:to-dark-600 flex items-center justify-center" style={{display: 'none'}}>
                      <span className="text-gray-500 dark:text-gray-400">프로젝트 이미지</span>
                    </div>
                  </div>
                  {project.featured && (
                    <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </div>
                  )}
                </div>

                {/* 프로젝트 정보 */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      project.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {project.status === 'completed' ? '완료' : 
                       project.status === 'in-progress' ? '진행중' : '계획'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </span>
                  </div>

                  {/* 참여 인원 및 역할 */}
                  {(project.participants || project.role) && (
                    <div className="mb-3 space-y-1">
                      {project.participants && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiUser size={14} />
                          <span>{project.participants}</span>
                        </div>
                      )}
                      {project.role && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiCode size={14} />
                          <span>{project.role}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {project.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* 기술 스택 */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 text-xs rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 text-xs rounded-md">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex gap-3">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 btn-outline text-center py-2 text-sm"
                      >
                        <FiGithub className="inline mr-2" size={16} />
                        GitHub
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target={
                          project.liveUrl.startsWith('/') ? undefined : '_blank'
                        }
                        rel={
                          project.liveUrl.startsWith('/')
                            ? undefined
                            : 'noopener noreferrer'
                        }
                        className="flex-1 btn-primary text-center py-2 text-sm"
                      >
                        <FiExternalLink className="inline mr-2" size={16} />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <FiFolder size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              프로젝트를 찾을 수 없습니다
            </h3>
            <p className="text-gray-500 dark:text-gray-600">
              검색어나 필터를 변경해보세요.
            </p>
          </motion.div>
        )}

        {/* 더 많은 프로젝트 보기 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="https://github.com/oikikomori/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center space-x-2"
          >
            <span>더 많은 프로젝트 보기</span>
            <FiGithub size={20} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
