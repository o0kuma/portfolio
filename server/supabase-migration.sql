-- Supabase 마이그레이션 스크립트
-- MongoDB에서 Supabase PostgreSQL로 변환

-- 1. 프로필 테이블 (사용자 정보)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  avatar TEXT,
  bio TEXT CHECK (char_length(bio) <= 500),
  website TEXT CHECK (website ~ '^https?://.+'),
  location VARCHAR(100),
  github TEXT,
  linkedin TEXT,
  twitter TEXT,
  instagram TEXT,
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT false,
  email_verification_token TEXT,
  email_verification_expires TIMESTAMP WITH TIME ZONE,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 포스트 테이블
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  category VARCHAR(20) DEFAULT 'general' CHECK (category IN ('general', 'tech', 'project', 'update')),
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 댓글 테이블 (포스트와 분리)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  github_url TEXT,
  live_url TEXT,
  featured BOOLEAN DEFAULT false,
  category VARCHAR(20) DEFAULT 'web' CHECK (category IN ('web', 'mobile', 'desktop', 'other')),
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'in-progress', 'planned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 연락처 테이블
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 대화 테이블
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(100) DEFAULT 'anonymous',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{
    "selectedTone": "친근하게",
    "language": "ko",
    "isActive": true
  }',
  statistics JSONB DEFAULT '{
    "totalMessages": 0,
    "userMessages": 0,
    "aiMessages": 0,
    "averageResponseTime": 0,
    "mostUsedTone": "친근하게",
    "lastActivity": null
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 메시지 테이블 (대화와 분리)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  message_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_features JSONB,
  metadata JSONB,
  response_time INTEGER DEFAULT 0
);

-- 8. AI 사용량 추적 테이블
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100),
  session_id VARCHAR(255),
  usage_type VARCHAR(20) NOT NULL CHECK (usage_type IN ('chat', 'improve', 'translate', 'summarize', 'suggest')),
  message_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, usage_type)
);

-- 9. 구독 테이블
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  plan_type VARCHAR(20) DEFAULT 'free' CHECK (plan_type IN ('free', 'premium', 'enterprise')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING gin(to_tsvector('korean', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING gin(to_tsvector('korean', title || ' ' || description || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_activity ON conversations((statistics->>'lastActivity')::timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_ai_usage_session_date ON ai_usage(session_id, date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 프로필 정책
CREATE POLICY "사용자는 자신의 프로필을 볼 수 있음" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "사용자는 자신의 프로필을 업데이트할 수 있음" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 포스트 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "모든 사용자가 포스트를 볼 수 있음" ON posts
  FOR SELECT USING (true);

-- 댓글 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "모든 사용자가 댓글을 볼 수 있음" ON comments
  FOR SELECT USING (true);

-- 프로젝트 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "모든 사용자가 프로젝트를 볼 수 있음" ON projects
  FOR SELECT USING (true);

-- 연락처 정책 (인증된 사용자만 생성 가능)
CREATE POLICY "인증된 사용자가 연락처를 생성할 수 있음" ON contacts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 대화 정책 (세션 기반)
CREATE POLICY "사용자는 자신의 대화를 볼 수 있음" ON conversations
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = 'anonymous');

CREATE POLICY "사용자는 자신의 대화를 업데이트할 수 있음" ON conversations
  FOR UPDATE USING (auth.uid()::text = user_id OR user_id = 'anonymous');

-- 메시지 정책 (대화와 연관)
CREATE POLICY "사용자는 관련 메시지를 볼 수 있음" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.user_id = auth.uid()::text OR conversations.user_id = 'anonymous')
    )
  );

-- 함수: 프로필 완성도 계산
CREATE OR REPLACE FUNCTION get_profile_completion(profile_row profiles)
RETURNS INTEGER AS $$
DECLARE
  completion INTEGER := 0;
BEGIN
  IF profile_row.first_name IS NOT NULL THEN completion := completion + 16; END IF;
  IF profile_row.last_name IS NOT NULL THEN completion := completion + 16; END IF;
  IF profile_row.bio IS NOT NULL THEN completion := completion + 17; END IF;
  IF profile_row.avatar IS NOT NULL THEN completion := completion + 17; END IF;
  IF profile_row.website IS NOT NULL THEN completion := completion + 17; END IF;
  IF profile_row.location IS NOT NULL THEN completion := completion + 17; END IF;
  
  RETURN completion;
END;
$$ LANGUAGE plpgsql;

-- 함수: 전체 이름 계산
CREATE OR REPLACE FUNCTION get_full_name(profile_row profiles)
RETURNS TEXT AS $$
BEGIN
  IF profile_row.first_name IS NOT NULL AND profile_row.last_name IS NOT NULL THEN
    RETURN profile_row.first_name || ' ' || profile_row.last_name;
  END IF;
  
  RETURN profile_row.username;
END;
$$ LANGUAGE plpgsql;

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 적용
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 뷰: 포스트와 댓글 수
CREATE OR REPLACE VIEW posts_with_comment_count AS
SELECT 
  p.*,
  COALESCE(c.comment_count, 0) as comment_count
FROM posts p
LEFT JOIN (
  SELECT post_id, COUNT(*) as comment_count
  FROM comments
  GROUP BY post_id
) c ON p.id = c.post_id;

-- 뷰: 대화와 메시지 수
CREATE OR REPLACE VIEW conversations_with_message_count AS
SELECT 
  c.*,
  COALESCE(m.message_count, 0) as message_count
FROM conversations c
LEFT JOIN (
  SELECT conversation_id, COUNT(*) as message_count
  FROM messages
  GROUP BY conversation_id
) m ON c.id = m.conversation_id;
