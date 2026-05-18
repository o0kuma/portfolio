export type Locale = 'ko' | 'en'

export const translations = {
  ko: {
    nav: {
      about: 'About',
      skills: 'Skills',
      projects: 'Projects',
      posts: 'Posts',
      contact: 'Contact',
      tetris: 'Tetris',
      langToggle: 'EN',
    },
    hero: {
      badge: 'Frontend Developer',
      nameMain: '오승일',
      nameSub: 'Seungil Oh',
      description:
        'React, Next.js, Svelte로 프론트엔드를 설계하고,\nNode.js 백엔드까지 다루는 {years}년 차 풀스택 개발자입니다.',
      viewProjects: '프로젝트 보기',
      contactMe: '연락하기',
      scrollDown: '아래로 스크롤',
    },
    about: {
      label: 'About',
      heading1: '설계하고 구현하는',
      heading2: '개발자입니다.',
      p1: '프론트엔드가 주 영역이지만, 서버와 DB도 직접 만들어야 할 때 뒤로 물러서지 않습니다. UI 컴포넌트를 설계하고 API를 연동하며, 필요하다면 백엔드 로직까지 끝까지 구현합니다.',
      p2: '{years}년 동안 금융 플랫폼, 트레이딩 시스템, 앱 서비스, 회사 사이트 등 다양한 프로젝트를 거쳐왔습니다. 요즘은 Next.js와 Svelte를 주로 쓰고 있고, TypeScript로 더 단단한 코드를 만드는 데 집중합니다.',
      p3: '화면의 완성도와 코드의 품질, 두 가지 모두를 놓치지 않으려 꾸준히 파고듭니다.',
      recentWork: 'Recent Work',
      statYearsSuffix: '년 경력',
      statProjectsSuffix: '프로젝트',
      statBirthSuffix: '년생',
      location: '서울 · 송파구',
      role: '프론트엔드 / 풀스택 개발자',
      works: [
        { label: 'BTB 사이트 유지보수 / Scale-up', status: '' },
        {
          label:
            'scaleup_tip 논문·특허 데이터 수집 — JSON 메타데이터 추출 및 서버 저장 관리',
          status: '',
        },
        { label: 'B2B 오픈마켓', status: '진행 중' },
      ],
    },
    skills: {
      label: 'Skills',
      heading1: '바다의 깊이처럼',
      heading2: '쌓아온 기술들',
      subtext: '수면에서 심해까지 — 다양한 깊이로 다양한 기술을 다룹니다.',
      footer: '— 항상 새로운 기술을 배우는 중입니다 —',
      zones: {
        surface: {
          depth: '수면',
          subtitle: 'Surface — 전문 영역',
          description: '매일 쓰고 누구보다 자신 있는 기술',
        },
        mid: {
          depth: '중층',
          subtitle: 'Mid Water — 활용 영역',
          description: '프로젝트에 적극적으로 활용하는 기술',
        },
        backend: {
          depth: '백엔드',
          subtitle: 'Backend — 서버사이드 영역',
          description: '서버·DB·API 구축에 활용하는 기술',
        },
        deep: {
          depth: '심해',
          subtitle: 'Deep — 탐험 영역',
          description: '경험은 있지만 계속 탐구 중인 기술',
        },
      },
    },
    contact: {
      label: 'Contact',
      heading1: '함께',
      heading2: '만들어요.',
      intro: '프로젝트 협업, 외주 작업,\n또는 그냥 인사도 좋습니다.\n빠르게 답변드리겠습니다.',
      namePlaceholder: '이름',
      emailPlaceholder: '이메일',
      subjectPlaceholder: '제목',
      messagePlaceholder: '메시지를 입력하세요',
      send: '전송하기',
      successTitle: '메시지 전송 완료!',
      successDesc: '빠른 시일 내에 답변드리겠습니다.',
      emailWarning:
        '메시지는 저장되었습니다. 이메일 알림은 잠시 후 전달될 수 있습니다.',
      newMessage: '새 메시지 작성',
      location: '서울 · 송파구',
      hours: 'Weekdays 9:00 – 18:00',
    },
    footer: {
      copyright: '© {year} 오승일. All rights reserved.',
    },
  },

  en: {
    nav: {
      about: 'About',
      skills: 'Skills',
      projects: 'Projects',
      posts: 'Posts',
      contact: 'Contact',
      tetris: 'Tetris',
      langToggle: 'KO',
    },
    hero: {
      badge: 'Frontend Developer',
      nameMain: 'Seungil Oh',
      nameSub: '오승일',
      description:
        'Designing frontend with React, Next.js, and Svelte,\na {years}-year full-stack developer who handles Node.js backend too.',
      viewProjects: 'View Projects',
      contactMe: 'Contact Me',
      scrollDown: 'Scroll down',
    },
    about: {
      label: 'About',
      heading1: 'I design and build',
      heading2: 'what matters.',
      p1: "Frontend is my main domain, but I don't step back when servers and DBs need to be built from scratch. I design UI components, integrate APIs, and implement backend logic end-to-end when needed.",
      p2: "Over {years} years I've worked on financial platforms, trading systems, app services, and corporate sites. Currently I mainly use Next.js and Svelte, focused on writing stronger code with TypeScript.",
      p3: 'I strive to deliver both pixel-perfect UI and quality code — never sacrificing one for the other.',
      recentWork: 'Recent Work',
      statYearsSuffix: 'yrs exp',
      statProjectsSuffix: 'projects',
      statBirthSuffix: 'born',
      location: 'Seoul · Songpa-gu',
      role: 'Frontend / Full-stack Developer',
      works: [
        { label: 'BTB Site Maintenance / Scale-up', status: '' },
        {
          label:
            'scaleup_tip Paper & Patent Data Collection — JSON metadata extraction & server management',
          status: '',
        },
        { label: 'B2B Open Market', status: 'In Progress' },
      ],
    },
    skills: {
      label: 'Skills',
      heading1: 'Like the depths of the ocean,',
      heading2: 'skills built over time',
      subtext: 'From surface to deep — technologies at every depth.',
      footer: '— Always learning something new —',
      zones: {
        surface: {
          depth: 'Surface',
          subtitle: 'Surface — Expertise',
          description: 'Used daily with full confidence',
        },
        mid: {
          depth: 'Mid Water',
          subtitle: 'Mid Water — Active Use',
          description: 'Actively used across projects',
        },
        backend: {
          depth: 'Backend',
          subtitle: 'Backend — Server Side',
          description: 'For building servers, DBs, and APIs',
        },
        deep: {
          depth: 'Deep',
          subtitle: 'Deep — Exploration',
          description: 'Experienced but still exploring',
        },
      },
    },
    contact: {
      label: 'Contact',
      heading1: "Let's build",
      heading2: 'together.',
      intro: "Project collaboration, freelance work,\nor just a friendly hello.\nI'll respond quickly.",
      namePlaceholder: 'Name',
      emailPlaceholder: 'Email',
      subjectPlaceholder: 'Subject',
      messagePlaceholder: 'Enter your message',
      send: 'Send Message',
      successTitle: 'Message Sent!',
      successDesc: "I'll get back to you as soon as possible.",
      emailWarning:
        'Your message was saved. Email notification may be delivered shortly.',
      newMessage: 'Write New Message',
      location: 'Seoul · Songpa-gu',
      hours: 'Weekdays 9:00 – 18:00',
    },
    footer: {
      copyright: '© {year} Seungil Oh. All rights reserved.',
    },
  },
} as const

export type TranslationDict = (typeof translations)['ko']

/** Replace {key} tokens in a string with the provided values. */
export function interpolate(
  str: string,
  vars: Record<string, string | number>,
): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''))
}
