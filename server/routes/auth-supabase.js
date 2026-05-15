// UNUSED - 레거시 파일
// Supabase Auth 기반 회원가입/로그인/프로필 라우트.
// server.js 에 마운트되지 않음 (app.use('/api/auth', ...) 구문 없음).
// 향후 인증 기능이 필요하면 ADMIN_API_TOKEN 또는 별도 JWT 방식으로 재구현 권장.
const express = require('express');
const { body, validationResult } = require('express-validator');
const supabaseService = require('../services/supabaseService');
const { loginLimiter } = require('../middleware/rateLimit');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 회원가입
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('사용자명은 3-30자 사이여야 합니다.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다.'),
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('비밀번호는 영문 대소문자와 숫자를 포함해야 합니다.'),
  body('profile.firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('이름은 최대 50자까지 가능합니다.'),
  body('profile.lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('성은 최대 50자까지 가능합니다.')
], async (req, res) => {
  try {
    // 검증 오류 확인
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '입력 데이터가 유효하지 않습니다.',
        details: errors.array()
      });
    }

    const { username, email, password, profile } = req.body;

    // 중복 사용자 확인
    const existingUser = await supabaseService.checkUsernameExists(username);
    if (existingUser) {
      return res.status(400).json({
        error: '이미 사용 중인 사용자명입니다.'
      });
    }

    // Supabase Auth로 사용자 생성
    const { data: authData, error: authError } = await supabaseService.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });

    if (authError) {
      return res.status(400).json({
        error: '회원가입 중 오류가 발생했습니다.',
        details: authError.message
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        error: '사용자 생성에 실패했습니다.'
      });
    }

    // 프로필 생성
    const profileData = {
      id: authData.user.id,
      username: username,
      first_name: profile?.firstName || null,
      last_name: profile?.lastName || null,
      avatar: null,
      bio: null,
      website: null,
      location: null,
      github: null,
      linkedin: null,
      twitter: null,
      instagram: null,
      role: 'user',
      is_active: true,
      email_verified: false
    };

    const userProfile = await supabaseService.createProfile(profileData);

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      user: {
        id: userProfile.id,
        username: userProfile.username,
        email: authData.user.email,
        role: userProfile.role,
        profile: {
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          avatar: userProfile.avatar,
          bio: userProfile.bio,
          website: userProfile.website,
          location: userProfile.location
        },
        social: {
          github: userProfile.github,
          linkedin: userProfile.linkedin,
          twitter: userProfile.twitter,
          instagram: userProfile.instagram
        },
        profileCompletion: 0, // 초기값
        emailVerified: userProfile.email_verified
      },
      session: authData.session
    });

  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      error: '회원가입 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 로그인
router.post('/login', loginLimiter, [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요.'),
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '입력 데이터가 유효하지 않습니다.',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Supabase Auth로 로그인
    const { data: authData, error: authError } = await supabaseService.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({
        error: '이메일 또는 비밀번호가 올바르지 않습니다.',
        details: authError.message
      });
    }

    if (!authData.user) {
      return res.status(401).json({
        error: '로그인에 실패했습니다.'
      });
    }

    // 프로필 조회
    const userProfile = await supabaseService.getProfile(authData.user.id);

    if (!userProfile || !userProfile.is_active) {
      return res.status(401).json({
        error: '비활성화된 계정입니다. 관리자에게 문의하세요.'
      });
    }

    // 마지막 로그인 업데이트
    await supabaseService.updateProfile(authData.user.id, {
      last_login: new Date().toISOString()
    });

    res.json({
      message: '로그인이 완료되었습니다.',
      user: {
        id: userProfile.id,
        username: userProfile.username,
        email: authData.user.email,
        role: userProfile.role,
        profile: {
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          avatar: userProfile.avatar,
          bio: userProfile.bio,
          website: userProfile.website,
          location: userProfile.location
        },
        social: {
          github: userProfile.github,
          linkedin: userProfile.linkedin,
          twitter: userProfile.twitter,
          instagram: userProfile.instagram
        },
        profileCompletion: 0, // TODO: 계산 로직 추가
        lastLogin: userProfile.last_login
      },
      session: authData.session
    });

  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      error: '로그인 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 로그아웃
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabaseService.supabase.auth.signOut();
    
    if (error) {
      return res.status(500).json({
        error: '로그아웃 중 오류가 발생했습니다.',
        details: error.message
      });
    }

    res.json({
      message: '로그아웃되었습니다.'
    });
  } catch (error) {
    console.error('로그아웃 오류:', error);
    res.status(500).json({
      error: '로그아웃 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 현재 사용자 정보 조회
router.get('/me', async (req, res) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: '인증 토큰이 필요합니다.'
      });
    }

    const token = authHeader.substring(7);

    // 토큰 검증
    const { data: { user }, error } = await supabaseService.supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: '유효하지 않은 토큰입니다.'
      });
    }

    // 프로필 조회
    const userProfile = await supabaseService.getProfile(user.id);

    if (!userProfile) {
      return res.status(404).json({
        error: '사용자 프로필을 찾을 수 없습니다.'
      });
    }

    res.json({
      user: {
        id: userProfile.id,
        username: userProfile.username,
        email: user.email,
        role: userProfile.role,
        profile: {
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          avatar: userProfile.avatar,
          bio: userProfile.bio,
          website: userProfile.website,
          location: userProfile.location
        },
        social: {
          github: userProfile.github,
          linkedin: userProfile.linkedin,
          twitter: userProfile.twitter,
          instagram: userProfile.instagram
        },
        profileCompletion: 0, // TODO: 계산 로직 추가
        lastLogin: userProfile.last_login,
        emailVerified: userProfile.email_verified
      }
    });

  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({
      error: '사용자 정보 조회 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 프로필 업데이트
router.put('/profile', [
  body('profile.firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('이름은 최대 50자까지 가능합니다.'),
  body('profile.lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('성은 최대 50자까지 가능합니다.'),
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('자기소개는 최대 500자까지 가능합니다.'),
  body('profile.website')
    .optional()
    .isURL()
    .withMessage('유효한 웹사이트 URL을 입력해주세요.'),
  body('profile.location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('위치는 최대 100자까지 가능합니다.'),
  body('social.github')
    .optional()
    .isURL()
    .withMessage('유효한 GitHub URL을 입력해주세요.'),
  body('social.linkedin')
    .optional()
    .isURL()
    .withMessage('유효한 LinkedIn URL을 입력해주세요.'),
  body('social.twitter')
    .optional()
    .isURL()
    .withMessage('유효한 Twitter URL을 입력해주세요.'),
  body('social.instagram')
    .optional()
    .isURL()
    .withMessage('유효한 Instagram URL을 입력해주세요.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '입력 데이터가 유효하지 않습니다.',
        details: errors.array()
      });
    }

    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: '인증 토큰이 필요합니다.'
      });
    }

    const token = authHeader.substring(7);

    // 토큰 검증
    const { data: { user }, error: authError } = await supabaseService.supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: '유효하지 않은 토큰입니다.'
      });
    }

    const { profile, social } = req.body;
    const updateData = {};

    if (profile) {
      updateData.first_name = profile.firstName;
      updateData.last_name = profile.lastName;
      updateData.bio = profile.bio;
      updateData.website = profile.website;
      updateData.location = profile.location;
    }

    if (social) {
      updateData.github = social.github;
      updateData.linkedin = social.linkedin;
      updateData.twitter = social.twitter;
      updateData.instagram = social.instagram;
    }

    const updatedProfile = await supabaseService.updateProfile(user.id, updateData);

    res.json({
      message: '프로필이 업데이트되었습니다.',
      user: {
        id: updatedProfile.id,
        username: updatedProfile.username,
        email: user.email,
        role: updatedProfile.role,
        profile: {
          firstName: updatedProfile.first_name,
          lastName: updatedProfile.last_name,
          avatar: updatedProfile.avatar,
          bio: updatedProfile.bio,
          website: updatedProfile.website,
          location: updatedProfile.location
        },
        social: {
          github: updatedProfile.github,
          linkedin: updatedProfile.linkedin,
          twitter: updatedProfile.twitter,
          instagram: updatedProfile.instagram
        },
        profileCompletion: 0 // TODO: 계산 로직 추가
      }
    });

  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(500).json({
      error: '프로필 업데이트 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 비밀번호 변경
router.put('/change-password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('현재 비밀번호를 입력해주세요.'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('새 비밀번호는 최소 6자 이상이어야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('새 비밀번호는 영문 대소문자와 숫자를 포함해야 합니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '입력 데이터가 유효하지 않습니다.',
        details: errors.array()
      });
    }

    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: '인증 토큰이 필요합니다.'
      });
    }

    const token = authHeader.substring(7);

    // 토큰 검증
    const { data: { user }, error: authError } = await supabaseService.supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: '유효하지 않은 토큰입니다.'
      });
    }

    const { newPassword } = req.body;

    // Supabase Auth로 비밀번호 업데이트
    const { error: updateError } = await supabaseService.supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return res.status(400).json({
        error: '비밀번호 변경에 실패했습니다.',
        details: updateError.message
      });
    }

    res.json({
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });

  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    res.status(500).json({
      error: '비밀번호 변경 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

module.exports = router;
