const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const ChatbotAI = require('../utils/chatbotAI');
const TranslationAI = require('../utils/translationAI');

// 자체 AI 초기화
const chatbotAI = new ChatbotAI();
const translationAI = new TranslationAI();

// AI 채팅 엔드포인트 (자체 AI + Supabase 연동)
router.post('/chat', async (req, res) => {
  try {
    const { message, tone = '친근하게', sessionId, userId = 'anonymous' } = req.body;

    if (!message) {
      return res.status(400).json({ error: '메시지가 필요합니다.' });
    }

    const startTime = Date.now();

    // 1. 대화 세션 가져오기 또는 생성
    const conversation = await supabaseService.getOrCreateConversation(sessionId, userId);
    
    // 2. 대화 히스토리 가져오기
    const conversationHistory = await supabaseService.getConversationHistory(sessionId, 20);
    
    // 3. 사용자 메시지 저장
    const userMessage = {
      id: require('uuid').v4(),
      content: message,
      isUser: true,
      timestamp: new Date(),
      responseTime: 0
    };
    
    await supabaseService.addMessage(sessionId, userMessage);

    // 4. AI 응답 생성
    const aiResponse = await chatbotAI.processMessage(message, tone);
    const responseTime = Date.now() - startTime;

    // 5. AI 응답 저장
    const aiMessage = {
      id: require('uuid').v4(),
      content: aiResponse.response,
      isUser: false,
      timestamp: new Date(),
      aiFeatures: {
        tone: tone,
        emotion: aiResponse.emotion,
        intent: aiResponse.intent,
        confidence: aiResponse.confidence
      },
      responseTime: responseTime
    };
    
    await supabaseService.addMessage(sessionId, aiMessage);

    res.json({
      success: aiResponse.success,
      response: aiResponse.response,
      emotion: aiResponse.emotion,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      responseTime: responseTime,
      sessionId: sessionId,
      messageId: aiMessage.id
    });

  } catch (error) {
    console.error('AI 채팅 오류:', error);
    res.status(500).json({ 
      success: false,
      error: 'AI 응답 생성 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 번역 엔드포인트
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage = 'ko' } = req.body;

    if (!text) {
      return res.status(400).json({ error: '번역할 텍스트가 필요합니다.' });
    }

    const translation = await translationAI.translateText(text, targetLanguage);

    res.json({
      success: true,
      originalText: text,
      translatedText: translation,
      targetLanguage: targetLanguage
    });

  } catch (error) {
    console.error('번역 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '번역 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 대화 히스토리 조회
router.get('/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50 } = req.query;

    const messages = await supabaseService.getConversationHistory(sessionId, parseInt(limit));

    res.json({
      success: true,
      sessionId: sessionId,
      messages: messages,
      count: messages.length
    });

  } catch (error) {
    console.error('대화 히스토리 조회 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '대화 히스토리 조회 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 대화 통계 조회
router.get('/conversation/:sessionId/stats', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const statistics = await supabaseService.getConversationStats(sessionId);
    if (!statistics) {
      return res.status(404).json({ 
        success: false,
        error: '대화를 찾을 수 없습니다.' 
      });
    }

    res.json({
      success: true,
      sessionId: sessionId,
      statistics
    });

  } catch (error) {
    console.error('대화 통계 조회 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '대화 통계 조회 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 대화 설정 업데이트
router.put('/conversation/:sessionId/settings', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { selectedTone, language, isActive } = req.body;

    const patch = {
      ...(selectedTone && { selectedTone }),
      ...(language && { language }),
      ...(isActive !== undefined && { isActive })
    };
    const settings = await supabaseService.updateConversationSettings(sessionId, patch);
    if (!settings) {
      return res.status(404).json({ 
        success: false,
        error: '대화를 찾을 수 없습니다.' 
      });
    }

    res.json({
      success: true,
      sessionId: sessionId,
      settings
    });

  } catch (error) {
    console.error('대화 설정 업데이트 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '대화 설정 업데이트 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 대화 삭제
router.delete('/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    await supabaseService.deleteConversation(sessionId);

    res.json({
      success: true,
      message: '대화가 삭제되었습니다.',
      sessionId: sessionId
    });

  } catch (error) {
    console.error('대화 삭제 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '대화 삭제 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// AI 기능 상태 확인
router.get('/status', async (req, res) => {
  try {
    const chatbotStatus = await chatbotAI.checkStatus();
    const translationStatus = await translationAI.checkStatus();

    res.json({
      success: true,
      services: {
        chatbot: chatbotStatus,
        translation: translationStatus
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI 상태 확인 오류:', error);
    res.status(500).json({ 
      success: false,
      error: 'AI 상태 확인 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

module.exports = router;
