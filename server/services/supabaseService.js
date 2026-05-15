const { query } = require('../config/db');
const { randomUUID } = require('crypto');

class DatabaseService {
  buildWhere(filters = {}, mapping = {}) {
    const where = [];
    const values = [];
    Object.entries(mapping).forEach(([key, column]) => {
      if (filters[key] !== undefined && filters[key] !== '') {
        values.push(filters[key]);
        where.push(`${column} = $${values.length}`);
      }
    });
    return { where, values };
  }

  async createProfile(userData) {
    const result = await query(
      `INSERT INTO profiles (
        id, username, first_name, last_name, avatar, bio, website, location,
        github, linkedin, twitter, instagram, role, is_active, email_verified
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        userData.id,
        userData.username,
        userData.first_name || null,
        userData.last_name || null,
        userData.avatar || null,
        userData.bio || null,
        userData.website || null,
        userData.location || null,
        userData.github || null,
        userData.linkedin || null,
        userData.twitter || null,
        userData.instagram || null,
        userData.role || 'user',
        userData.is_active ?? true,
        userData.email_verified ?? false
      ]
    );
    return result.rows[0];
  }

  async getProfile(userId) {
    const result = await query('SELECT * FROM profiles WHERE id = $1 LIMIT 1', [userId]);
    return result.rows[0] || null;
  }

  async updateProfile(userId, updateData) {
    const entries = Object.entries(updateData || {});
    if (!entries.length) return this.getProfile(userId);
    const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v);
    values.push(userId);
    const result = await query(`UPDATE profiles SET ${setClause} WHERE id = $${values.length} RETURNING *`, values);
    return result.rows[0] || null;
  }

  async checkUsernameExists(username) {
    const result = await query('SELECT id FROM profiles WHERE username = $1 LIMIT 1', [username]);
    return Boolean(result.rows[0]);
  }

  async getPosts(filters = {}) {
    const { where, values } = this.buildWhere(filters, { category: 'category', featured: 'featured' });
    if (filters.search) {
      values.push(`%${filters.search}%`);
      where.push(`(title ILIKE $${values.length} OR content ILIKE $${values.length})`);
    }
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    values.push(limit, offset);
    const result = await query(
      `SELECT * FROM posts
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return result.rows;
  }

  async getPost(postId) {
    const result = await query('SELECT * FROM posts WHERE id = $1 LIMIT 1', [postId]);
    return result.rows[0] || null;
  }

  async createPost(postData) {
    const result = await query(
      `INSERT INTO posts (
        title, content, author, category, tags, likes, views, featured, cover_image_url, status
      ) VALUES ($1,$2,$3,$4,$5::text[],$6,$7,$8,$9,$10) RETURNING *`,
      [
        postData.title,
        postData.content,
        postData.author || 'iykyk',
        postData.category || 'general',
        postData.tags || [],
        postData.likes || 0,
        postData.views || 0,
        postData.featured || false,
        postData.cover_image_url || null,
        postData.status || 'published'
      ]
    );
    return result.rows[0];
  }

  async updatePost(postId, updateData) {
    const entries = Object.entries(updateData || {});
    if (!entries.length) return this.getPost(postId);
    const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v);
    values.push(postId);
    const result = await query(`UPDATE posts SET ${setClause} WHERE id = $${values.length} RETURNING *`, values);
    return result.rows[0] || null;
  }

  async deletePost(postId) {
    await query('DELETE FROM posts WHERE id = $1', [postId]);
    return true;
  }

  async incrementViews(postId) {
    const result = await query('UPDATE posts SET views = COALESCE(views, 0) + 1 WHERE id = $1 RETURNING *', [postId]);
    return result.rows[0] || null;
  }

  async getComments(postId) {
    const result = await query('SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC', [postId]);
    return result.rows;
  }

  async createComment(commentData) {
    const result = await query(
      'INSERT INTO comments (post_id, author, content) VALUES ($1,$2,$3) RETURNING *',
      [commentData.post_id, commentData.author, commentData.content]
    );
    return result.rows[0];
  }

  async getProjects(filters = {}) {
    const { where, values } = this.buildWhere(filters, { category: 'category', featured: 'featured' });
    if (filters.search) {
      values.push(`%${filters.search}%`);
      where.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length} OR content ILIKE $${values.length})`);
    }
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    values.push(limit, offset);
    const result = await query(
      `SELECT * FROM projects
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return result.rows;
  }

  async getProject(projectId) {
    const result = await query('SELECT * FROM projects WHERE id = $1 LIMIT 1', [projectId]);
    return result.rows[0] || null;
  }

  async createProject(projectData) {
    const result = await query(
      `INSERT INTO projects (
        title, description, content, technologies, images, github_url, live_url, category, status, featured, start_date, end_date
      ) VALUES ($1,$2,$3,$4::text[],$5::text[],$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        projectData.title,
        projectData.description,
        projectData.content,
        projectData.technologies || [],
        projectData.images || [],
        projectData.githubUrl || projectData.github_url || null,
        projectData.liveUrl || projectData.live_url || null,
        projectData.category || 'web',
        projectData.status || 'completed',
        projectData.featured || false,
        projectData.startDate || projectData.start_date || null,
        projectData.endDate || projectData.end_date || null
      ]
    );
    return result.rows[0];
  }

  async updateProject(projectId, updateData) {
    const mapped = { ...updateData };
    if (mapped.githubUrl !== undefined) {
      mapped.github_url = mapped.githubUrl;
      delete mapped.githubUrl;
    }
    if (mapped.liveUrl !== undefined) {
      mapped.live_url = mapped.liveUrl;
      delete mapped.liveUrl;
    }
    if (mapped.startDate !== undefined) {
      mapped.start_date = mapped.startDate;
      delete mapped.startDate;
    }
    if (mapped.endDate !== undefined) {
      mapped.end_date = mapped.endDate;
      delete mapped.endDate;
    }
    const entries = Object.entries(mapped || {});
    if (!entries.length) return this.getProject(projectId);
    const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v);
    values.push(projectId);
    const result = await query(`UPDATE projects SET ${setClause} WHERE id = $${values.length} RETURNING *`, values);
    return result.rows[0] || null;
  }

  async deleteProject(projectId) {
    await query('DELETE FROM projects WHERE id = $1', [projectId]);
    return true;
  }

  async createContact(contactData) {
    const result = await query(
      `INSERT INTO contacts (name, email, subject, message, status, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        contactData.name,
        contactData.email,
        contactData.subject,
        contactData.message,
        contactData.status || 'unread',
        contactData.ip_address || null,
        contactData.user_agent || null
      ]
    );
    return result.rows[0];
  }

  async getContacts(filters = {}) {
    const { where, values } = this.buildWhere(filters, { status: 'status' });
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    values.push(limit, offset);
    const result = await query(
      `SELECT * FROM contacts
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return result.rows;
  }

  async getContact(contactId) {
    const result = await query('SELECT * FROM contacts WHERE id = $1 LIMIT 1', [contactId]);
    return result.rows[0] || null;
  }

  async updateContactStatus(contactId, status) {
    const result = await query(
      'UPDATE contacts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, contactId]
    );
    return result.rows[0] || null;
  }

  async searchPosts(term) {
    const result = await query(
      `SELECT * FROM posts WHERE title ILIKE $1 OR content ILIKE $1 ORDER BY created_at DESC`,
      [`%${term}%`]
    );
    return result.rows;
  }

  async searchProjects(term) {
    const result = await query(
      `SELECT * FROM projects WHERE title ILIKE $1 OR description ILIKE $1 OR content ILIKE $1 ORDER BY created_at DESC`,
      [`%${term}%`]
    );
    return result.rows;
  }

  async getCount(tableName, filters = {}) {
    const allowed = ['posts', 'projects', 'contacts', 'subscriptions', 'ai_usage'];
    if (!allowed.includes(tableName)) throw new Error('Unsupported table for count');
    const { where, values } = this.buildWhere(filters, {
      category: 'category',
      featured: 'featured',
      status: 'status',
      user_id: 'user_id',
      usage_type: 'usage_type',
      date: 'date'
    });
    if (filters.search) {
      values.push(`%${filters.search}%`);
      const searchCol = tableName === 'projects'
        ? `(title ILIKE $${values.length} OR description ILIKE $${values.length} OR content ILIKE $${values.length})`
        : `(title ILIKE $${values.length} OR content ILIKE $${values.length})`;
      where.push(searchCol);
    }
    const result = await query(
      `SELECT COUNT(*)::int AS total FROM ${tableName} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}`,
      values
    );
    return result.rows[0]?.total || 0;
  }

  async getOrCreateConversation(sessionId, userId = 'anonymous') {
    const sid = sessionId || randomUUID();
    const existing = await query('SELECT * FROM conversations WHERE session_id = $1 LIMIT 1', [sid]);
    if (existing.rows[0]) return existing.rows[0];
    const created = await query(
      `INSERT INTO conversations (session_id, user_id, settings, statistics, is_active)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, true) RETURNING *`,
      [sid, userId, JSON.stringify({ selectedTone: '친근하게', language: 'ko' }), JSON.stringify({})]
    );
    return created.rows[0];
  }

  async addMessage(sessionId, message) {
    const conversation = await this.getOrCreateConversation(sessionId, 'anonymous');
    const result = await query(
      `INSERT INTO messages (conversation_id, message_id, content, is_user, timestamp, ai_features, response_time)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7) RETURNING *`,
      [
        conversation.id,
        message.id || randomUUID(),
        message.content,
        message.isUser === true,
        message.timestamp || new Date().toISOString(),
        JSON.stringify(message.aiFeatures || {}),
        message.responseTime || 0
      ]
    );
    return result.rows[0];
  }

  async getConversationHistory(sessionId, limit = 50) {
    const conversation = await query('SELECT id FROM conversations WHERE session_id = $1 LIMIT 1', [sessionId]);
    const cid = conversation.rows[0]?.id;
    if (!cid) return [];
    const result = await query(
      `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY timestamp ASC LIMIT $2`,
      [cid, limit]
    );
    return result.rows.map((row) => ({
      id: row.message_id || row.id,
      content: row.content,
      isUser: row.is_user,
      timestamp: row.timestamp,
      aiFeatures: row.ai_features || {},
      responseTime: row.response_time || 0
    }));
  }

  async getConversationStats(sessionId) {
    const result = await query('SELECT statistics FROM conversations WHERE session_id = $1 LIMIT 1', [sessionId]);
    return result.rows[0] ? (result.rows[0].statistics || {}) : null;
  }

  async updateConversationSettings(sessionId, patch) {
    const current = await query('SELECT settings FROM conversations WHERE session_id = $1 LIMIT 1', [sessionId]);
    if (!current.rows[0]) return null;
    const updated = { ...(current.rows[0].settings || {}), ...patch };
    const result = await query(
      'UPDATE conversations SET settings = $1::jsonb WHERE session_id = $2 RETURNING settings',
      [JSON.stringify(updated), sessionId]
    );
    return result.rows[0]?.settings || null;
  }

  async deleteConversation(sessionId) {
    await query('DELETE FROM conversations WHERE session_id = $1', [sessionId]);
    return true;
  }
}

module.exports = new DatabaseService();
