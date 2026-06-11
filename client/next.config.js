/** @type {import('next').NextConfig} */
const path = require('path')
const fs = require('fs')

// 상위 디렉토리(server)의 .env 파일에서 환경 변수 로드
// 프로덕션 빌드에서는 파일 시스템 접근을 시도하지 않음 (환경 변수는 플랫폼에서 직접 설정)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const serverEnvPath = path.join(__dirname, '..', 'server', '.env')
  if (fs.existsSync(serverEnvPath)) {
    const envFile = fs.readFileSync(serverEnvPath, 'utf8')
    envFile.split('\n').forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const match = trimmedLine.match(/^([^=:#]+)=(.*)$/)
        if (match) {
          const key = match[1].trim()
          const value = match[2].trim().replace(/^["']|["']$/g, '')
          
          // Neon/PostgreSQL 연결 문자열 로드
          if (key === 'DATABASE_URL' && !process.env.DATABASE_URL) {
            process.env.DATABASE_URL = value
          }
          
          // GEMINI_API_KEY 로드
          if (key === 'GEMINI_API_KEY' && !process.env.GEMINI_API_KEY) {
            process.env.GEMINI_API_KEY = value
          }

          const portfolioKeys = [
            'PORTFOLIO_ENABLED',
            'PORTFOLIO_DISABLED',
            'NEXT_PUBLIC_PORTFOLIO_ENABLED',
            'NEXT_PUBLIC_PORTFOLIO_DISABLED',
          ]
          if (portfolioKeys.includes(key) && !process.env[key]) {
            process.env[key] = value
          }
        }
      }
    })
  }
}

const nextConfig = {
  eslint: {
    // Existing pages have pre-core-web-vitals issues; new code is linted in CI by path
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'kuuuma.com'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };
    return config;
  },
  // 주의: env 설정은 클라이언트 사이드에 노출됩니다
  // GEMINI_API_KEY는 서버 사이드 전용이므로 env에 포함하지 않습니다
  // API 라우트에서는 process.env.GEMINI_API_KEY를 직접 사용합니다
}

module.exports = nextConfig
