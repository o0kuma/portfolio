const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const { body, validationResult } = require('express-validator');
const { requireAdminToken } = require('../middleware/adminTokenAuth');

// 모든 포스트 조회
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, page = 1, limit = 10 } = req.query;
    
    const filters = {
      category,
      featured: featured === 'true' ? true : undefined,
      search,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    // 빈 값 필터 제거
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    const posts = await supabaseService.getPosts(filters);
    const total = await supabaseService.getCount('posts', filters);
    
    res.json({
      posts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('포스트 조회 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 특정 포스트 조회 (조회수 증가)
router.get('/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    
    // 조회수 증가
    await supabaseService.incrementViews(postId);
    
    // 포스트 조회
    const post = await supabaseService.getPost(postId);
    
    if (!post) {
      return res.status(404).json({ message: '포스트를 찾을 수 없습니다.' });
    }

    // 댓글 조회
    const comments = await supabaseService.getComments(postId);
    
    res.json({
      ...post,
      comments
    });
  } catch (error) {
    console.error('포스트 조회 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 포스트 생성
router.post('/', requireAdminToken, [
  body('title').notEmpty().withMessage('제목은 필수입니다.'),
  body('content').notEmpty().withMessage('내용은 필수입니다.'),
  body('author').notEmpty().withMessage('작성자는 필수입니다.'),
  body('category').optional().isIn(['general', 'tech', 'economy', 'coin', 'travel', 'food', 'lottery', 'project', 'update']).withMessage('유효하지 않은 카테고리입니다.'),
  body('tags').optional().isArray().withMessage('태그는 배열이어야 합니다.'),
  body('featured').optional().isBoolean().withMessage('featured는 불린 값이어야 합니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const postData = {
      ...req.body,
      tags: req.body.tags || [],
      featured: req.body.featured || false,
      views: 0,
      likes: 0
    };

    const post = await supabaseService.createPost(postData);
    
    res.status(201).json({
      message: '포스트가 생성되었습니다.',
      post
    });
  } catch (error) {
    console.error('포스트 생성 오류:', error);
    
    // author 컬럼 오류인 경우 더 자세한 안내
    if (error.message && error.message.includes('author')) {
      return res.status(500).json({ 
        success: false,
        error: '테이블 구조 오류',
        message: error.message,
        solution: {
          step1: 'Supabase Dashboard (https://app.supabase.com) 접속',
          step2: 'SQL Editor 열기',
          step3: '다음 SQL 실행:',
          sql: "ALTER TABLE posts ADD COLUMN IF NOT EXISTS author VARCHAR(100) NOT NULL DEFAULT 'iykyk';"
        }
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: '포스트 생성 실패',
      message: error.message 
    });
  }
});

// 포스트 업데이트
router.put('/:id', requireAdminToken, [
  body('title').optional().notEmpty().withMessage('제목은 비어있을 수 없습니다.'),
  body('content').optional().notEmpty().withMessage('내용은 비어있을 수 없습니다.'),
  body('category').optional().isIn(['general', 'tech', 'economy', 'coin', 'travel', 'food', 'lottery', 'project', 'update']).withMessage('유효하지 않은 카테고리입니다.'),
  body('tags').optional().isArray().withMessage('태그는 배열이어야 합니다.'),
  body('featured').optional().isBoolean().withMessage('featured는 불린 값이어야 합니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const postId = req.params.id;
    const updateData = { ...req.body };

    const post = await supabaseService.updatePost(postId, updateData);
    
    if (!post) {
      return res.status(404).json({ message: '포스트를 찾을 수 없습니다.' });
    }

    res.json({
      message: '포스트가 업데이트되었습니다.',
      post
    });
  } catch (error) {
    console.error('포스트 업데이트 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 포스트 삭제
router.delete('/:id', requireAdminToken, async (req, res) => {
  try {
    const postId = req.params.id;
    
    await supabaseService.deletePost(postId);
    
    res.json({
      message: '포스트가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('포스트 삭제 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 댓글 추가
router.post('/:id/comments', [
  body('author').notEmpty().withMessage('작성자는 필수입니다.'),
  body('content').notEmpty().withMessage('댓글 내용은 필수입니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const postId = req.params.id;
    const commentData = {
      post_id: postId,
      author: req.body.author,
      content: req.body.content
    };

    const comment = await supabaseService.createComment(commentData);
    
    res.status(201).json({
      message: '댓글이 추가되었습니다.',
      comment
    });
  } catch (error) {
    console.error('댓글 추가 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 좋아요 토글
router.post('/:id/like', async (req, res) => {
  try {
    const postId = req.params.id;
    
    // 현재 포스트 조회
    const post = await supabaseService.getPost(postId);
    if (!post) {
      return res.status(404).json({ message: '포스트를 찾을 수 없습니다.' });
    }

    // 좋아요 수 증가
    const updatedPost = await supabaseService.updatePost(postId, {
      likes: (post.likes || 0) + 1
    });
    
    res.json({
      message: '좋아요가 추가되었습니다.',
      likes: updatedPost.likes
    });
  } catch (error) {
    console.error('좋아요 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 검색
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = req.params.term;
    
    const posts = await supabaseService.searchPosts(searchTerm);
    
    res.json({
      posts,
      searchTerm,
      count: posts.length
    });
  } catch (error) {
    console.error('검색 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
