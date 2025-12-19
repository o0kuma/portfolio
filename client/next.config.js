/** @type {import('next').NextConfig} */
const path = require('path')
const fs = require('fs')

// 상위 디렉토리(server)의 .env 파일에서 환경 변수 로드
const serverEnvPath = path.join(__dirname, '..', 'server', '.env')
if (fs.existsSync(serverEnvPath)) {
  const envFile = fs.readFileSync(serverEnvPath, 'utf8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      // OPENAI_API_KEY만 process.env에 추가 (다른 변수는 이미 설정되어 있을 수 있음)
      if (key === 'OPENAI_API_KEY' && !process.env.OPENAI_API_KEY) {
        process.env.OPENAI_API_KEY = value
      }
    }
  })
}

const nextConfig = {
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
  // 환경 변수를 빌드 타임에 포함
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
}

module.exports = nextConfig
