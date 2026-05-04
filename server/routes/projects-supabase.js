const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const { body, validationResult } = require('express-validator');
const { requireAdminToken } = require('../middleware/adminTokenAuth');

// 모든 프로젝트 조회
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

    const projects = await supabaseService.getProjects(filters);
    const total = await supabaseService.getCount('projects', filters);
    
    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('프로젝트 조회 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 특정 프로젝트 조회
router.get('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    const project = await supabaseService.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' });
    }

    res.json(project);
  } catch (error) {
    console.error('프로젝트 조회 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 프로젝트 생성
router.post('/', requireAdminToken, [
  body('title').notEmpty().withMessage('제목은 필수입니다.'),
  body('description').notEmpty().withMessage('설명은 필수입니다.'),
  body('content').notEmpty().withMessage('내용은 필수입니다.'),
  body('technologies').optional().isArray().withMessage('기술 스택은 배열이어야 합니다.'),
  body('images').optional().isArray().withMessage('이미지는 배열이어야 합니다.'),
  body('githubUrl').optional().isURL().withMessage('유효한 GitHub URL을 입력해주세요.'),
  body('liveUrl').optional().isURL().withMessage('유효한 라이브 URL을 입력해주세요.'),
  body('category').optional().isIn(['web', 'mobile', 'desktop', 'other']).withMessage('유효하지 않은 카테고리입니다.'),
  body('status').optional().isIn(['completed', 'in-progress', 'planned']).withMessage('유효하지 않은 상태입니다.'),
  body('featured').optional().isBoolean().withMessage('featured는 불린 값이어야 합니다.'),
  body('startDate').optional().isISO8601().withMessage('유효한 시작 날짜를 입력해주세요.'),
  body('endDate').optional().isISO8601().withMessage('유효한 종료 날짜를 입력해주세요.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const projectData = {
      ...req.body,
      technologies: req.body.technologies || [],
      images: req.body.images || [],
      featured: req.body.featured || false,
      category: req.body.category || 'web',
      status: req.body.status || 'completed'
    };

    const project = await supabaseService.createProject(projectData);
    
    res.status(201).json({
      message: '프로젝트가 생성되었습니다.',
      project
    });
  } catch (error) {
    console.error('프로젝트 생성 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 프로젝트 업데이트
router.put('/:id', requireAdminToken, [
  body('title').optional().notEmpty().withMessage('제목은 비어있을 수 없습니다.'),
  body('description').optional().notEmpty().withMessage('설명은 비어있을 수 없습니다.'),
  body('content').optional().notEmpty().withMessage('내용은 비어있을 수 없습니다.'),
  body('technologies').optional().isArray().withMessage('기술 스택은 배열이어야 합니다.'),
  body('images').optional().isArray().withMessage('이미지는 배열이어야 합니다.'),
  body('githubUrl').optional().isURL().withMessage('유효한 GitHub URL을 입력해주세요.'),
  body('liveUrl').optional().isURL().withMessage('유효한 라이브 URL을 입력해주세요.'),
  body('category').optional().isIn(['web', 'mobile', 'desktop', 'other']).withMessage('유효하지 않은 카테고리입니다.'),
  body('status').optional().isIn(['completed', 'in-progress', 'planned']).withMessage('유효하지 않은 상태입니다.'),
  body('featured').optional().isBoolean().withMessage('featured는 불린 값이어야 합니다.'),
  body('startDate').optional().isISO8601().withMessage('유효한 시작 날짜를 입력해주세요.'),
  body('endDate').optional().isISO8601().withMessage('유효한 종료 날짜를 입력해주세요.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const projectId = req.params.id;
    const updateData = { ...req.body };

    const project = await supabaseService.updateProject(projectId, updateData);
    
    if (!project) {
      return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' });
    }

    res.json({
      message: '프로젝트가 업데이트되었습니다.',
      project
    });
  } catch (error) {
    console.error('프로젝트 업데이트 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 프로젝트 삭제
router.delete('/:id', requireAdminToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    
    await supabaseService.deleteProject(projectId);
    
    res.json({
      message: '프로젝트가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('프로젝트 삭제 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 검색
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = req.params.term;
    
    const projects = await supabaseService.searchProjects(searchTerm);
    
    res.json({
      projects,
      searchTerm,
      count: projects.length
    });
  } catch (error) {
    console.error('검색 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 카테고리별 프로젝트 조회
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const { page = 1, limit = 10 } = req.query;
    
    const filters = {
      category,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const projects = await supabaseService.getProjects(filters);
    const total = await supabaseService.getCount('projects', { category });
    
    res.json({
      projects,
      category,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('카테고리별 프로젝트 조회 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 추천 프로젝트 조회
router.get('/featured/list', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const filters = {
      featured: true,
      limit: parseInt(limit)
    };

    const projects = await supabaseService.getProjects(filters);
    
    res.json({
      projects,
      count: projects.length
    });
  } catch (error) {
    console.error('추천 프로젝트 조회 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
