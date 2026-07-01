'use client'

import { useEffect, useState } from 'react'

// TWA(플레이스토어 패키징 앱)로 실행 중인지 판별.
// standalone/fullscreen으로 열렸다면 포트폴리오 메인으로 나가는 링크를 숨겨
// "이 앱은 아케이드만 담당한다"는 scope 경계를 지킨다.
export function useIsStandalone(): boolean {
  const [standalone, setStandalone] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)')
    const check = () =>
      setStandalone(
        mq.matches ||
        // iOS Safari
        (window.navigator as unknown as { standalone?: boolean }).standalone === true,
      )
    check()
    mq.addEventListener('change', check)
    return () => mq.removeEventListener('change', check)
  }, [])

  return standalone
}
