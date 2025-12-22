const { supabase } = require('../config/supabase');

class SupabaseService {
  constructor() {
    this.supabase = supabase;
  }

  // ==================== 사용자 관련 ====================
  
  // 사용자 프로필 생성
  async createProfile(userData) {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 사용자 프로필 조회
  async getProfile(userId) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // 사용자명으로 프로필 조회
  async getProfileByUsername(username) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  }

  // 이메일로 프로필 조회
  async getProfileByEmail(email) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('username', email) // Supabase Auth의 email은 username 필드에 저장
      .single();

    if (error) throw error;
    return data;
  }

  // 프로필 업데이트
  async updateProfile(userId, updateData) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 사용자명 중복 확인
  async checkUsernameExists(username) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    return !error && data;
  }

  // ==================== 포스트 관련 ====================

  // 모든 포스트 조회
  async getPosts(filters = {}) {
    let query = this.supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    // featured 컬럼이 있으면 필터링 (없으면 무시)
    if (filters.featured !== undefined) {
      try {
        query = query.eq('featured', filters.featured);
      } catch (error) {
        // featured 컬럼이 없으면 필터 제거
        console.warn('featured 컬럼이 없어 필터링을 건너뜁니다.');
      }
    }
    if (filters.search) {
      query = query.textSearch('title,content', filters.search);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // 특정 포스트 조회
  async getPost(postId) {
    const { data, error } = await this.supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) throw error;
    return data;
  }

  // 포스트 생성
  async createPost(postData) {
    // author가 없으면 기본값 설정
    if (!postData.author) {
      postData.author = 'iykyk';
    }
    
    // 테이블 구조에 맞게 데이터 변환
    // 테이블에 있는 컬럼만 사용 (views, featured는 선택사항)
    const insertData = {
      title: postData.title,
      content: postData.content,
      author: postData.author,
      category: postData.category || 'general',
      tags: postData.tags || [],
      likes: postData.likes || 0
    };
    
    // 테이블에 컬럼이 있으면 추가
    // views 컬럼이 있으면 추가
    if (postData.views !== undefined) {
      insertData.views = postData.views;
    }
    
    // featured 컬럼이 있으면 추가
    if (postData.featured !== undefined) {
      insertData.featured = postData.featured;
    }
    
    // cover_image_url이 있으면 추가
    if (postData.cover_image_url) {
      insertData.cover_image_url = postData.cover_image_url;
    }
    
    // status가 있으면 추가
    if (postData.status) {
      insertData.status = postData.status;
    }

    const { data, error } = await this.supabase
      .from('posts')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      // author 컬럼 오류인 경우 더 자세한 정보 제공
      if (error.message && (error.message.includes('author') || error.message.includes('column') || error.code === '42703')) {
        const errorMsg = `❌ Supabase 테이블에 'author' 컬럼이 없습니다.\n\n` +
          `해결 방법:\n` +
          `1. Supabase Dashboard (https://app.supabase.com) 접속\n` +
          `2. SQL Editor 열기\n` +
          `3. 다음 SQL 실행:\n\n` +
          `ALTER TABLE posts ADD COLUMN IF NOT EXISTS author VARCHAR(100) NOT NULL DEFAULT 'iykyk';\n\n` +
          `또는 server/scripts/add-author-column.sql 파일의 내용을 실행하세요.`;
        throw new Error(errorMsg);
      }
      
      // 다른 컬럼 오류도 처리
      if (error.code === '42703') {
        throw new Error(`테이블 컬럼 오류: ${error.message}\nSupabase SQL Editor에서 server/supabase-migration.sql을 실행하세요.`);
      }
      
      throw error;
    }
    return data;
  }

  // 포스트 업데이트
  async updatePost(postId, updateData) {
    const { data, error } = await this.supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 포스트 삭제
  async deletePost(postId) {
    const { error } = await this.supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    return true;
  }

  // 조회수 증가
  async incrementViews(postId) {
    const { data, error } = await this.supabase
      .from('posts')
      .select('views')
      .eq('id', postId)
      .single();

    if (error) throw error;

    const { data: updatedData, error: updateError } = await this.supabase
      .from('posts')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', postId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedData;
  }

  // ==================== 댓글 관련 ====================

  // 포스트의 댓글 조회
  async getComments(postId) {
    const { data, error } = await this.supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  // 댓글 생성
  async createComment(commentData) {
    const { data, error } = await this.supabase
      .from('comments')
      .insert([commentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== 프로젝트 관련 ====================

  // 모든 프로젝트 조회
  async getProjects(filters = {}) {
    let query = this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    // featured 컬럼이 있으면 필터링 (없으면 무시)
    if (filters.featured !== undefined) {
      try {
        query = query.eq('featured', filters.featured);
      } catch (error) {
        // featured 컬럼이 없으면 필터 제거
        console.warn('featured 컬럼이 없어 필터링을 건너뜁니다.');
      }
    }
    if (filters.search) {
      query = query.textSearch('title,description,content', filters.search);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // 특정 프로젝트 조회
  async getProject(projectId) {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;
    return data;
  }

  // 프로젝트 생성
  async createProject(projectData) {
    const { data, error } = await this.supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 프로젝트 업데이트
  async updateProject(projectId, updateData) {
    const { data, error } = await this.supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 프로젝트 삭제
  async deleteProject(projectId) {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
    return true;
  }

  // ==================== 연락처 관련 ====================

  // 연락처 메시지 생성
  async createContact(contactData) {
    const { data, error } = await this.supabase
      .from('contacts')
      .insert([contactData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 모든 연락처 메시지 조회
  async getContacts(filters = {}) {
    let query = this.supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // 연락처 상태 업데이트
  async updateContactStatus(contactId, status) {
    const { data, error } = await this.supabase
      .from('contacts')
      .update({ status })
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== 대화 관련 ====================

  // 대화 생성 또는 가져오기
  async getOrCreateConversation(sessionId, userId = 'anonymous') {
    // 기존 대화 찾기
    const { data: existingConversation, error: findError } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (existingConversation && !findError) {
      return existingConversation;
    }

    // 새 대화 생성
    const { data: newConversation, error: createError } = await this.supabase
      .from('conversations')
      .insert([{
        session_id: sessionId,
        user_id: userId,
        settings: {
          selectedTone: '친근하게',
          language: 'ko',
          isActive: true
        },
        statistics: {
          totalMessages: 0,
          userMessages: 0,
          aiMessages: 0,
          averageResponseTime: 0,
          mostUsedTone: '친근하게',
          lastActivity: new Date().toISOString()
        }
      }])
      .select()
      .single();

    if (createError) throw createError;
    return newConversation;
  }

  // 대화 히스토리 가져오기
  async getConversationHistory(sessionId, limit = 20) {
    const { data: conversation, error: convError } = await this.supabase
      .from('conversations')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (convError || !conversation) {
      return [];
    }

    const { data: messages, error: msgError } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('timestamp', { ascending: true })
      .limit(limit);

    if (msgError) throw msgError;
    return messages || [];
  }

  // 메시지 추가
  async addMessage(sessionId, messageData) {
    // 대화 가져오기
    const conversation = await this.getOrCreateConversation(sessionId, messageData.userId);

    // 메시지 추가
    const { data: message, error: msgError } = await this.supabase
      .from('messages')
      .insert([{
        conversation_id: conversation.id,
        message_id: messageData.id,
        content: messageData.content,
        is_user: messageData.isUser,
        timestamp: messageData.timestamp || new Date().toISOString(),
        ai_features: messageData.aiFeatures || null,
        metadata: messageData.metadata || null,
        response_time: messageData.responseTime || 0
      }])
      .select()
      .single();

    if (msgError) throw msgError;

    // 통계 업데이트
    await this.updateConversationStatistics(conversation.id);

    return message;
  }

  // 대화 통계 업데이트
  async updateConversationStatistics(conversationId) {
    // 메시지 수 계산
    const { data: messages, error: msgError } = await this.supabase
      .from('messages')
      .select('is_user, response_time, ai_features')
      .eq('conversation_id', conversationId);

    if (msgError) throw msgError;

    const totalMessages = messages.length;
    const userMessages = messages.filter(m => m.is_user).length;
    const aiMessages = messages.filter(m => !m.is_user).length;
    
    // 평균 응답 시간 계산
    const responseTimes = messages
      .filter(m => !m.is_user && m.response_time)
      .map(m => m.response_time);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    // 가장 많이 사용된 톤 계산
    const tones = messages
      .filter(m => m.ai_features && m.ai_features.tone)
      .map(m => m.ai_features.tone);
    const toneCounts = {};
    tones.forEach(tone => {
      toneCounts[tone] = (toneCounts[tone] || 0) + 1;
    });
    const mostUsedTone = Object.keys(toneCounts).reduce((a, b) => 
      toneCounts[a] > toneCounts[b] ? a : b, '친근하게'
    );

    // 통계 업데이트
    const { error: updateError } = await this.supabase
      .from('conversations')
      .update({
        statistics: {
          totalMessages,
          userMessages,
          aiMessages,
          averageResponseTime: Math.round(averageResponseTime),
          mostUsedTone,
          lastActivity: new Date().toISOString()
        }
      })
      .eq('id', conversationId);

    if (updateError) throw updateError;
  }

  // ==================== 검색 관련 ====================

  // 전체 텍스트 검색
  async searchPosts(searchTerm) {
    const { data, error } = await this.supabase
      .from('posts')
      .select('*')
      .textSearch('title,content', searchTerm)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async searchProjects(searchTerm) {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .textSearch('title,description,content', searchTerm)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // ==================== 유틸리티 ====================

  // 페이지네이션을 위한 카운트
  async getCount(table, filters = {}) {
    let query = this.supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    // 필터 적용
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && key !== 'limit' && key !== 'offset') {
        query = query.eq(key, filters[key]);
      }
    });

    const { count, error } = await query;
    if (error) throw error;
    return count;
  }
}

module.exports = new SupabaseService();
