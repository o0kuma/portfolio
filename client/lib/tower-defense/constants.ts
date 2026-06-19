/** Tower Defense — balance, grid, path & palette constants */
import type { Cell, Vec } from './types'

/** Logical tile grid. The canvas scales this to fit while preserving aspect. */
export const GRID_COLS = 16
export const GRID_ROWS = 12
export const TILE = 40 // logical px per tile
export const WORLD_WIDTH = GRID_COLS * TILE
export const WORLD_HEIGHT = GRID_ROWS * TILE

export const START_GOLD = 150
export const START_LIVES = 20

/** Gold cost to fuse two adjacent max-level towers into an evolved tower. */
export const EVOLVE_COST = 80

/**
 * Fixed path as grid cells (col,row), entrance -> exit. Enemies walk cell
 * centers. Every cell on this list is non-buildable.
 */
export const PATH_CELLS: Cell[] = [
  { col: 0, row: 2 },
  { col: 3, row: 2 },
  { col: 3, row: 6 },
  { col: 6, row: 6 },
  { col: 6, row: 2 },
  { col: 9, row: 2 },
  { col: 9, row: 9 },
  { col: 12, row: 9 },
  { col: 12, row: 4 },
  { col: 15, row: 4 },
]

/** Cell center -> world pixel position. */
export function cellCenter(col: number, row: number): Vec {
  return { x: col * TILE + TILE / 2, y: row * TILE + TILE / 2 }
}

/** Expanded waypoint list (world px) the enemies interpolate between. */
export const WAYPOINTS: Vec[] = PATH_CELLS.map((c) => cellCenter(c.col, c.row))

/** Build the set of path-occupied cells (so towers can't be placed on the road). */
export function buildPathCellSet(cells: Cell[] = PATH_CELLS): Set<string> {
  const set = new Set<string>()
  for (let i = 0; i < cells.length - 1; i++) {
    const a = cells[i]
    const b = cells[i + 1]
    const dc = Math.sign(b.col - a.col)
    const dr = Math.sign(b.row - a.row)
    let c = a.col
    let r = a.row
    set.add(`${c},${r}`)
    while (c !== b.col || r !== b.row) {
      c += dc
      r += dr
      set.add(`${c},${r}`)
    }
  }
  return set
}

/** Build the waypoint list (world px) from a list of path corner cells. */
export function buildWaypoints(cells: Cell[]): Vec[] {
  return cells.map((c) => cellCenter(c.col, c.row))
}

// ---------------------------------------------------------------------------
// Multiple maps (Feature 3)
// ---------------------------------------------------------------------------

export type MapId = 'classic' | 'maze' | 'highway'

export interface MapDef {
  id: MapId
  /** localization key into towerDefensePage.maps */
  nameKey: MapId
  pathCells: Cell[]
}

const MAZE_CELLS: Cell[] = [
  { col: 0, row: 1 },
  { col: 4, row: 1 },
  { col: 4, row: 4 },
  { col: 1, row: 4 },
  { col: 1, row: 7 },
  { col: 6, row: 7 },
  { col: 6, row: 3 },
  { col: 9, row: 3 },
  { col: 9, row: 9 },
  { col: 13, row: 9 },
  { col: 13, row: 5 },
  { col: 15, row: 5 },
]

const HIGHWAY_CELLS: Cell[] = [
  { col: 0, row: 3 },
  { col: 13, row: 3 },
  { col: 13, row: 8 },
  { col: 2, row: 8 },
  { col: 2, row: 10 },
  { col: 15, row: 10 },
]

export const MAP_DEFS: MapDef[] = [
  { id: 'classic', nameKey: 'classic', pathCells: PATH_CELLS },
  { id: 'maze', nameKey: 'maze', pathCells: MAZE_CELLS },
  { id: 'highway', nameKey: 'highway', pathCells: HIGHWAY_CELLS },
]

export function mapDefById(id: MapId | string | null | undefined): MapDef {
  return MAP_DEFS.find((m) => m.id === id) ?? MAP_DEFS[0]
}

export const TD_MAP_KEY = 'tower-defense-map'
export const TD_AUTOSTART_KEY = 'tower-defense-autostart'

/** Special wave events (Feature 4). */
export type WaveEvent = 'rush' | 'armored' | 'swarm' | 'elite' | null

/** Endless scaling. Wave N (1-indexed). */
export function waveEnemyCount(wave: number): number {
  return 6 + Math.floor(wave * 1.6)
}

/** Multiplicative HP ramp so late waves stay tense but never plateau. */
export function enemyHpScale(wave: number): number {
  return Math.pow(1.18, wave - 1)
}

/** Enemies speed up very slightly over time. */
export function enemySpeedScale(wave: number): number {
  return 1 + Math.min(0.6, (wave - 1) * 0.02)
}

/** Gold bounty per kill scales mildly so economy keeps pace. */
export function bountyScale(wave: number): number {
  return 1 + (wave - 1) * 0.06
}

export const BOSS_EVERY = 10

/** Meta-upgrade modal is offered every N cleared waves. */
export const UPGRADE_EVERY_WAVES = 5

/** Retro NES-ish palette used across the canvas. */
export const PALETTE = {
  bg: '#0e1020',
  grass: '#1b2942',
  grassAlt: '#16223a',
  road: '#3a2f1e',
  roadEdge: '#54442a',
  buildable: '#22324f',
  text: '#e7ecff',
  pulse: '#38bdf8',
  splash: '#f87171',
  frost: '#5eead4',
  beam: '#c084fc',
  blizzard: '#7dd3fc',
  railgun: '#fca5a5',
  tempest: '#fcd34d',
  prism: '#e9d5ff',
  enemyNormal: '#a3e635',
  enemyFast: '#fbbf24',
  enemyTank: '#94a3b8',
  enemyTankBody: '#6b7150',
  enemyTankTread: '#2f3326',
  enemyBoss: '#fb7185',
  gold: '#fde047',
  life: '#fb7185',
  hpBack: '#1a1f33',
  hp: '#f87171',
  enemyGhostBody: '#c8d8ff',
  enemyGhostEye: '#1a1a3e',
  enemyRegenBody: '#22bb66',
  enemyRegenGlow: '#00ff88',
  towerSniper: '#3a3a4a',
  towerSupport: '#3b6fd4',
} as const

export const HIGH_SCORE_KEY = 'tower-defense-best'
export const TD_SESSION_ID_KEY = 'tower-defense-session-id'
export const TD_PLAYER_NAME_KEY = 'tower-defense-player-name'

/** Local best record shape persisted to localStorage. */
export type TowerDefenseBest = {
  wave: number
  kills: number
}
