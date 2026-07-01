import type { MiniGame } from './engine'
import { tapTiming } from './games/tap-timing'
import { dodge } from './games/dodge'
import { reaction } from './games/reaction'

// 새 게임 추가 시 여기 배열에 등록하면 메인 메뉴 + 라우팅에 자동 반영됨.
export const ARCADE_GAMES: MiniGame<any>[] = [tapTiming, dodge, reaction]

export function getArcadeGame(id: string): MiniGame<any> | undefined {
  return ARCADE_GAMES.find((g) => g.id === id)
}
