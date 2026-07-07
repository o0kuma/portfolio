'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

const FILES_KO = {
  'about.txt': `이름: 오승일 (kuuuma)
직업: 프론트엔드 / 풀스택 개발자
기술: React, Next.js, TypeScript, Node.js, PostgreSQL
특기: 웹 게임 개발, UI/UX 설계
연락: 사이트 내 Contact 폼`,
  'skills.txt': `Frontend: React, Next.js, TypeScript, TailwindCSS
Backend: Node.js, Express, PostgreSQL, Prisma
Tools: Git, Docker, Vercel, Supabase
Games: Canvas API, WebSocket, Game Loop`,
  'projects.txt': `1. 포트폴리오 사이트 (kuuuma.com)
   - Next.js 14, TailwindCSS, PostgreSQL
2. 테트리스 게임
   - Canvas API, 순수 TypeScript
3. 서바이브 게임
   - 2D 슈팅, 보스 스테이지, 업그레이드 시스템
4. 타워 디펜스
   - 경로 탐색, 웨이브 시스템
5. 타이핑 게임
   - WPM 측정, 리더보드`,
  'contact.txt': `이메일: 사이트 Contact 폼 이용
GitHub: github.com/kuuuma
포트폴리오: kuuuma.com`,
}

const FILES_EN = {
  'about.txt': `Name: Seungil Oh (kuuuma)
Role: Frontend / Full-stack Developer
Tech: React, Next.js, TypeScript, Node.js, PostgreSQL
Specialty: Web game development, UI/UX design
Contact: Use the Contact form on this site`,
  'skills.txt': `Frontend: React, Next.js, TypeScript, TailwindCSS
Backend: Node.js, Express, PostgreSQL, Prisma
Tools: Git, Docker, Vercel, Supabase
Games: Canvas API, WebSocket, Game Loop`,
  'projects.txt': `1. Portfolio site (kuuuma.com)
   - Next.js 14, TailwindCSS, PostgreSQL
2. Tetris
   - Canvas API, pure TypeScript
3. Survive
   - 2D shooter, boss stages, upgrade system
4. Tower Defense
   - Pathfinding, wave system
5. Typing Game
   - WPM measurement, leaderboard`,
  'contact.txt': `Email: Use the Contact form on this site
GitHub: github.com/kuuuma
Portfolio: kuuuma.com`,
}

function buildCommands(files: typeof FILES_KO, en: boolean): Record<string, (args: string[]) => string | null> {
  return {
    help: () =>
      en
        ? `Available commands:
  ls              - list files
  cat <file>      - view file contents
  cd <path>       - navigate (about, posts, food, games, portfolio)
  clear           - clear the screen
  whoami          - developer info
  skills          - tech stack
  projects        - project list
  contact         - contact info
  play <game>     - launch a game (tetris, survive, tower)
  kuuma           - say hi to Kuuma
  help            - this help`
        : `사용 가능한 명령어:
  ls              - 파일 목록 보기
  cat <파일>      - 파일 내용 보기
  cd <경로>       - 페이지 이동 (about, posts, food, games, portfolio)
  clear           - 화면 지우기
  whoami          - 개발자 정보
  skills          - 기술 스택
  projects        - 프로젝트 목록
  contact         - 연락처
  play <게임>     - 게임 실행 (tetris, survive, tower)
  kuuma           - 쿠마에게 인사
  help            - 도움말`,
    ls: () => Object.keys(files).join('  '),
    cat: (args) => {
      const file = args[0]
      if (!file) return en ? 'usage: cat <filename>' : '사용법: cat <파일명>'
      return files[file as keyof typeof files] ?? `cat: ${file}: No such file or directory`
    },
    whoami: () => files['about.txt'],
    skills: () => files['skills.txt'],
    projects: () => files['projects.txt'],
    contact: () => files['contact.txt'],
    clear: () => null, // special
    kuuma: () => (en ? "Hi! I'm Kuuma 👋 Press J to chat!" : '안녕하세요! 저는 쿠마입니다 👋 J키를 누르면 대화할 수 있어요!'),
    play: (args) => {
      const game = args[0]
      if (!game) return en ? 'usage: play <tetris|survive|tower>' : '사용법: play <tetris|survive|tower>'
      const routes: Record<string, string> = { tetris: '/tetris', survive: '/survive', tower: '/tower-defense' }
      if (routes[game]) return `__navigate__${routes[game]}`
      return en
        ? `play: ${game}: unknown game. Choose from tetris, survive, tower.`
        : `play: ${game}: 알 수 없는 게임. tetris, survive, tower 중 선택하세요.`
    },
    cd: (args) => {
      const dest = args[0]
      const routes: Record<string, string> = {
        about: '/portfolio', posts: '/posts', food: '/food',
        games: '/games', portfolio: '/portfolio', home: '/', '/': '/'
      }
      if (routes[dest]) return `__navigate__${routes[dest]}`
      return `cd: ${dest}: No such directory`
    },
  }
}

interface Line {
  type: 'input' | 'output' | 'error' | 'system'
  text: string
}

export default function TerminalPage() {
  const { locale } = useLanguage()
  const en = locale === 'en'
  const FILES = en ? FILES_EN : FILES_KO
  const COMMANDS = buildCommands(FILES, en)
  const [lines, setLines] = useState<Line[]>([
    { type: 'system', text: 'kuuuma portfolio terminal v1.0.0' },
    { type: 'system', text: '──────────────────────────────────' },
    { type: 'system', text: en ? "Type 'help' to see available commands." : "도움말을 보려면 'help'를 입력하세요." },
    { type: 'system', text: '' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    inputRef.current?.focus()
    bottomRef.current?.scrollIntoView()
  }, [lines])

  const handleCommand = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    setHistory(h => [trimmed, ...h].slice(0, 50))
    setHistoryIdx(-1)

    const [cmd, ...args] = trimmed.split(/\s+/)
    const handler = COMMANDS[cmd.toLowerCase()]

    const newLines: Line[] = [{ type: 'input', text: `$ ${trimmed}` }]

    if (cmd.toLowerCase() === 'clear') {
      setLines([{ type: 'system', text: 'kuuuma terminal — cleared' }, { type: 'system', text: '' }])
      setInput('')
      return
    }

    if (!handler) {
      newLines.push({
        type: 'error',
        text: en ? `command not found: ${cmd}. Try 'help'.` : `command not found: ${cmd}. 'help' 를 입력해보세요.`,
      })
    } else {
      const result = handler(args)
      if (result?.startsWith('__navigate__')) {
        const path = result.replace('__navigate__', '')
        newLines.push({ type: 'output', text: en ? `→ navigating to ${path}...` : `→ ${path} 로 이동합니다...` })
        setTimeout(() => router.push(path), 800)
      } else if (result !== null && result !== undefined) {
        newLines.push({ type: 'output', text: result })
      }
    }

    newLines.push({ type: 'system', text: '' })
    setLines(l => [...l, ...newLines])
    setInput('')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = historyIdx + 1
      if (idx < history.length) {
        setHistoryIdx(idx)
        setInput(history[idx])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = historyIdx - 1
      if (idx < 0) { setHistoryIdx(-1); setInput('') }
      else { setHistoryIdx(idx); setInput(history[idx]) }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const cmds = Object.keys(COMMANDS)
      const match = cmds.find(c => c.startsWith(input))
      if (match) setInput(match)
    }
  }

  return (
    <div
      className="min-h-screen bg-black text-green-400 font-mono text-sm p-6 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="max-w-3xl mx-auto">
        {/* Title bar */}
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-green-900">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-3 text-green-600 text-xs">kuuuma@portfolio ~ terminal</span>
          <a href="/" className="ml-auto text-green-700 hover:text-green-500 text-xs transition-colors">{en ? '← Exit' : '← 나가기'}</a>
        </div>

        {/* Output lines */}
        {lines.map((line, i) => (
          <div key={i} className={`leading-relaxed whitespace-pre-wrap ${
            line.type === 'input' ? 'text-green-300' :
            line.type === 'error' ? 'text-red-400' :
            line.type === 'system' ? 'text-green-700' :
            'text-green-400'
          }`}>
            {line.text}
          </div>
        ))}

        {/* Input line */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-green-500">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-green-300 outline-none caret-green-400"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
