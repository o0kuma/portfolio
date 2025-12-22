const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
// 서버 사이드에서는 Service Role Key를 우선 사용 (RLS 우회)
const supabaseUrl = process.env.SUPABASE_URL || 'https://test.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'test-anon-key';

// 디버깅: 환경 변수 확인
console.log('=== Supabase 환경 변수 확인 (서버) ===');
console.log('SUPABASE_URL:', supabaseUrl !== 'https://test.supabase.co' ? `${supabaseUrl.substring(0, 30)}...` : '❌ 설정되지 않음 (기본값 사용)');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : '❌ 설정되지 않음');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? `${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...` : '❌ 설정되지 않음');
console.log('사용할 키:', supabaseKey !== 'test-anon-key' ? (process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role Key ✅' : 'Anon Key ⚠️') : '❌ 기본값');
console.log('===================================');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.log('⚠️ Supabase 환경변수가 설정되지 않았습니다.');
  console.log('SUPABASE_URL과 SUPABASE_ANON_KEY를 설정해주세요.');
  console.log('파일 위치: server/.env');
  console.log('테스트용 더미 키를 사용합니다.');
}

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// 데이터베이스 연결 테스트
const testConnection = async () => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️ Supabase 연결을 건너뜁니다. 환경변수를 설정해주세요.');
      return false;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase 연결 실패:', error.message);
      return false;
    }

    console.log('✅ Supabase 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ Supabase 연결 오류:', error.message);
    return false;
  }
};

module.exports = {
  supabase,
  testConnection
};
