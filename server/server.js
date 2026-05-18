const express = require('express');
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Neon(PostgreSQL) 연결
const { testConnection } = require('./config/db');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

const CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://kuuuma.com',
  'https://www.kuuuma.com'
];

// Socket.io 설정
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// 접속 중인 소켓 ID 집합 (중복 없는 실시간 카운트)
const activeConnections = new Map();

io.on('connection', (socket) => {
  activeConnections.set(socket.id, { connectedAt: Date.now() });
  const count = activeConnections.size;

  io.emit('visitor_count', { count });

  socket.on('request_visitor_count', () => {
    socket.emit('visitor_count', { count: activeConnections.size });
  });

  socket.on('disconnect', () => {
    activeConnections.delete(socket.id);
    io.emit('visitor_count', { count: activeConnections.size });
  });
});

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 로그 디렉토리 생성
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 미들웨어
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}));

app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));

// 로깅 설정
const logStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: logStream }));
app.use(morgan('dev'));

app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_FILE_SIZE || '10mb' }));

// 정적 파일 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 상태 체크
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// OAuth 콜백 라우트
app.get('/auth/callback', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: green;">✅ OAuth 인증이 완료되었습니다!</h2>
        <p>이제 Gmail 이메일 전송 기능을 사용할 수 있습니다.</p>
        <p>이 창을 닫아도 됩니다.</p>
      </body>
    </html>
  `);
});

// 이메일 설정 테스트 API
app.get('/api/test-email-config', async (req, res) => {
  try {
    const { validateOAuthConfig } = require('./utils/oauth');
    
    // 환경변수 검증
    validateOAuthConfig();
    
    res.json({
      success: true,
      message: '이메일 설정이 올바르게 구성되었습니다.',
      config: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
        smtpUser: process.env.SMTP_USER
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '이메일 설정에 문제가 있습니다.',
      error: error.message
    });
  }
});

// 라우트
app.use('/api/projects', require('./routes/projects-supabase'));
app.use('/api/posts', require('./routes/posts-supabase'));
app.use('/api/contact', require('./routes/contact-supabase'));
app.use('/api/ai', require('./routes/ai-supabase'));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: '포트폴리오 API 서버가 실행 중입니다.',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      posts: '/api/posts',
      contact: '/api/contact',
      health: '/api/health'
    }
  });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // 로그 파일에 에러 기록
  const errorLog = fs.createWriteStream(
    path.join(__dirname, 'logs', 'error.log'),
    { flags: 'a' }
  );
  errorLog.write(`${new Date().toISOString()} - ${err.stack}\n`);
  
  res.status(500).json({ 
    message: '서버 내부 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 핸들링
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: '요청한 리소스를 찾을 수 없습니다.',
    path: req.originalUrl,
    method: req.method
  });
});

// 서버 시작
const startServer = async () => {
  try {
    // Neon 연결 테스트
    try {
      const isConnected = await testConnection();
      if (isConnected) {
        console.log('✅ Neon(PostgreSQL)에 연결되었습니다.');
      } else {
        console.log('ℹ️ Neon 연결을 건너뛰었습니다. DATABASE_URL을 확인해주세요.');
      }
    } catch (dbError) {
      console.error('⚠️ Neon 연결 실패, 서버는 계속 실행됩니다:', dbError.message);
    }
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`🔌 Socket.io 실시간 방문자 카운터 활성화`);
      console.log(`📁 업로드 디렉토리: ${uploadDir}`);
      console.log(`📝 로그 디렉토리: ${logDir}`);
      console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

startServer();
