const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const { body, validationResult } = require('express-validator');
const { sendContactEmail } = require('../utils/email');

// 연락처 메시지 전송
router.post('/', [
  body('name').notEmpty().withMessage('이름은 필수입니다.'),
  body('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
  body('subject').notEmpty().withMessage('제목은 필수입니다.'),
  body('message').notEmpty().withMessage('메시지는 필수입니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const contactData = {
      ...req.body,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };
    
    // Supabase에 연락처 메시지 저장
    const savedContact = await supabaseService.createContact(contactData);
    console.log('✅ 메시지가 데이터베이스에 저장되었습니다:', savedContact.id);
    
    // 메일 전송 시도
    console.log('이메일 전송 시도 중...');
    let emailResult = { success: false, message: '이메일 전송 실패' };
    
    try {
      emailResult = await sendContactEmail(req.body);
      console.log('이메일 전송 결과:', emailResult);
    } catch (emailError) {
      console.error('이메일 전송 오류:', emailError);
      emailResult = { 
        success: false, 
        message: `이메일 전송 실패: ${emailError.message}` 
      };
    }
    
    // 성공 응답
    if (emailResult.success) {
      res.status(201).json({
        success: true,
        message: '메시지가 성공적으로 전송되었습니다.',
        contactId: savedContact.id,
        emailSent: true
      });
    } else {
      res.status(201).json({
        success: true,
        message: '메시지는 저장되었지만 이메일 전송에 실패했습니다.',
        contactId: savedContact.id,
        emailSent: false,
        emailError: emailResult.message
      });
    }
    
  } catch (error) {
    console.error('연락처 메시지 처리 오류:', error);
    res.status(500).json({ 
      success: false,
      message: '메시지 전송 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
});

// 모든 연락처 메시지 조회 (관리자용)
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filters = {
      status,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    // 빈 값 필터 제거
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    const contacts = await supabaseService.getContacts(filters);
    const total = await supabaseService.getCount('contacts', filters);
    
    res.json({
      contacts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('연락처 메시지 조회 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 특정 연락처 메시지 조회
router.get('/:id', async (req, res) => {
  try {
    const contactId = req.params.id;
    const contact = await supabaseService.getContact(contactId);
    
    if (!contact) {
      return res.status(404).json({ message: '연락처 메시지를 찾을 수 없습니다.' });
    }

    res.json(contact);
  } catch (error) {
    console.error('연락처 메시지 조회 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 연락처 상태 업데이트 (관리자용)
router.put('/:id/status', [
  body('status').isIn(['unread', 'read', 'replied']).withMessage('유효하지 않은 상태입니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contactId = req.params.id;
    const { status } = req.body;
    
    const contact = await supabaseService.updateContactStatus(contactId, status);
    
    res.json({
      message: '연락처 상태가 업데이트되었습니다.',
      contact
    });
  } catch (error) {
    console.error('연락처 상태 업데이트 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 읽지 않은 메시지 수 조회
router.get('/stats/unread-count', async (req, res) => {
  try {
    const count = await supabaseService.getCount('contacts', { status: 'unread' });
    
    res.json({
      unreadCount: count
    });
  } catch (error) {
    console.error('읽지 않은 메시지 수 조회 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 연락처 통계 조회
router.get('/stats/overview', async (req, res) => {
  try {
    const total = await supabaseService.getCount('contacts');
    const unread = await supabaseService.getCount('contacts', { status: 'unread' });
    const read = await supabaseService.getCount('contacts', { status: 'read' });
    const replied = await supabaseService.getCount('contacts', { status: 'replied' });
    
    res.json({
      total,
      unread,
      read,
      replied,
      stats: {
        unreadPercentage: total > 0 ? Math.round((unread / total) * 100) : 0,
        repliedPercentage: total > 0 ? Math.round((replied / total) * 100) : 0
      }
    });
  } catch (error) {
    console.error('연락처 통계 조회 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
