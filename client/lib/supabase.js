import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 디버깅: 환경 변수 확인
if (typeof window === 'undefined') {
  // 서버 사이드에서만 로그 출력
  console.log('=== Supabase 환경 변수 확인 (클라이언트) ===');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ 설정되지 않음');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ 설정되지 않음');
  console.log('URL 길이:', supabaseUrl?.length || 0);
  console.log('KEY 길이:', supabaseAnonKey?.length || 0);
  console.log('모든 NEXT_PUBLIC_ 변수:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')));
  console.log('==========================================');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.');
  console.error('파일 위치: client/.env.local');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);
