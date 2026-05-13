const nodemailer = require('nodemailer');
const { getAccessToken, validateOAuthConfig } = require('./oauth');

// OAuth 2.0 설정 검증
const validateEmailConfig = () => {
  try {
    validateOAuthConfig();
    return true;
  } catch (error) {
    console.error('이메일 설정 검증 실패:', error.message);
    return false;
  }
};

// OAuth 2.0을 사용한 이메일 전송기 생성
const createTransporter = async () => {
  if (!validateEmailConfig()) {
    throw new Error('이메일 설정이 올바르지 않습니다. 환경변수를 확인해주세요.');
  }

  try {
    const accessToken = await getAccessToken();
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SMTP_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken
      }
    });
  } catch (error) {
    console.error('OAuth 2.0 전송기 생성 실패:', error);
    
    // DNS 오류인 경우 특별 처리
    if (error.code === 'DNS_HOSTNAME_RESOLVED_PRIVATE' || 
        error.message.includes('DNS') || 
        error.message.includes('ENOTFOUND')) {
      throw new Error('Google OAuth 서비스에 연결할 수 없습니다. 네트워크 설정을 확인해주세요.');
    }
    
    throw new Error(`이메일 전송기 생성에 실패했습니다: ${error.message}`);
  }
};

// 연락처 메시지 전송
const sendContactEmail = async (contactData) => {
  try {
    console.log('이메일 전송 시작:', { 
      name: contactData.name, 
      email: contactData.email,
      subject: contactData.subject 
    });
    
    console.log('OAuth 설정 확인 중...');
    const transporter = await createTransporter();
    console.log('이메일 전송기 생성 완료');
    
    // 전송기 연결 테스트
    console.log('전송기 연결 테스트 중...');
    await transporter.verify();
    console.log('전송기 연결 테스트 성공');
    
    // 관리자에게 보낼 메일
    const adminMailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // 관리자 이메일
      subject: `[포트폴리오] 새로운 연락 메시지: ${contactData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            새로운 연락 메시지
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #555; margin-top: 0;">발신자 정보</h3>
            <p><strong>이름:</strong> ${contactData.name}</p>
            <p><strong>이메일:</strong> ${contactData.email}</p>
            <p><strong>제목:</strong> ${contactData.subject}</p>
            <p><strong>전송 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
            <h3 style="color: #555; margin-top: 0;">메시지 내용</h3>
            <div style="white-space: pre-wrap; line-height: 1.6;">${contactData.message}</div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-radius: 8px;">
            <p style="margin: 0; color: #1976d2;">
              <strong>답변하기:</strong> 
              <a href="mailto:${contactData.email}?subject=Re: ${contactData.subject}" 
                 style="color: #1976d2; text-decoration: none;">
                ${contactData.email}
              </a>
            </p>
          </div>
        </div>
      `
    };

    // 발신자에게 자동 응답 메일
    const autoReplyOptions = {
      from: process.env.SMTP_USER,
      to: contactData.email,
      subject: '메시지가 성공적으로 전송되었습니다 - 오승일 포트폴리오',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            메시지 전송 완료
          </h2>
          
          <p>안녕하세요, <strong>${contactData.name}</strong>님!</p>
          
          <p>포트폴리오 사이트를 통해 보내주신 메시지가 성공적으로 전송되었습니다.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #555; margin-top: 0;">전송된 메시지</h3>
            <p><strong>제목:</strong> ${contactData.subject}</p>
            <p><strong>내용:</strong></p>
            <div style="white-space: pre-wrap; line-height: 1.6; background-color: #ffffff; padding: 15px; border-radius: 4px; border: 1px solid #e9ecef;">
              ${contactData.message}
            </div>
          </div>
          
          <p>빠른 시일 내에 답변드리도록 하겠습니다. 감사합니다!</p>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #e8f5e8; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #2e7d32;">
              <strong>오승일</strong><br>
              프론트엔드 개발자<br>
              <a href="mailto:${process.env.SMTP_USER}" style="color: #2e7d32;">${process.env.SMTP_USER}</a>
            </p>
          </div>
        </div>
      `
    };

    // 두 메일 모두 전송
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(autoReplyOptions)
    ]);

    return { success: true, message: '메일이 성공적으로 전송되었습니다.' };
  } catch (error) {
    console.error('메일 전송 실패:', error);
    return { success: false, message: '메일 전송에 실패했습니다.', error: error.message };
  }
};

module.exports = {
  sendContactEmail
};
