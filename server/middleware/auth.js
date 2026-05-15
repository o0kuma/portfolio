// UNUSED - 레거시 파일
// Supabase Auth 기반 인증 미들웨어. routes/auth-supabase.js 에서만 사용하며
// auth-supabase.js 라우트 자체가 server.js 에 마운트되지 않아 실제로 동작하지 않음.
const { supabase } = require('../config/supabase');

// Supabase Auth 토큰 검증 미들웨어
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: '액세스 토큰이 필요합니다.' 
      });
    }

    // Supabase Auth로 토큰 검증
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: '유효하지 않은 토큰입니다.' 
      });
    }

    // 프로필 정보 가져오기
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ 
        error: '사용자 프로필을 찾을 수 없습니다.' 
      });
    }

    req.user = {
      id: profile.id,
      username: profile.username,
      email: user.email,
      role: profile.role,
      profile: {
        firstName: profile.first_name,
        lastName: profile.last_name,
        avatar: profile.avatar,
        bio: profile.bio,
        website: profile.website,
        location: profile.location
      },
      social: {
        github: profile.github,
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        instagram: profile.instagram
      }
    };

    next();
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    return res.status(500).json({ 
      error: '토큰 검증 중 오류가 발생했습니다.' 
    });
  }
};

// 관리자 권한 확인 미들웨어
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: '인증이 필요합니다.' 
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: '관리자 권한이 필요합니다.' 
      });
    }

    next();
  } catch (error) {
    console.error('권한 확인 오류:', error);
    return res.status(500).json({ 
      error: '권한 확인 중 오류가 발생했습니다.' 
    });
  }
};

// 선택적 인증 미들웨어 (로그인하지 않은 사용자도 접근 가능하지만, 로그인한 경우 사용자 정보 제공)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        // Supabase Auth로 토큰 검증
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (!error && user) {
          // 프로필 정보 가져오기
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!profileError && profile) {
            req.user = {
              id: profile.id,
              username: profile.username,
              email: user.email,
              role: profile.role,
              profile: {
                firstName: profile.first_name,
                lastName: profile.last_name,
                avatar: profile.avatar,
                bio: profile.bio,
                website: profile.website,
                location: profile.location
              },
              social: {
                github: profile.github,
                linkedin: profile.linkedin,
                twitter: profile.twitter,
                instagram: profile.instagram
              }
            };
          }
        }
      } catch (error) {
        // 토큰이 유효하지 않아도 계속 진행
        console.log('선택적 인증 실패:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('선택적 인증 오류:', error);
    next(); // 오류가 발생해도 계속 진행
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};
