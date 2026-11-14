'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

/**
 * Visitor-controlled extras that used to float in the screen corners. They now
 * live in the footer's settings row, start off, and remember the visitor's
 * choice in localStorage. The chatbot is not here: it is the one widget that
 * stays on screen.
 */
export type SiteSettingKey = 'sound' | 'companion' | 'cursors'

type Settings = Record<SiteSettingKey, boolean>

const STORAGE_KEYS: Record<SiteSettingKey, string> = {
  // Kept from the old floating toggle so an existing choice carries over.
  sound: 'ambient_soundtrack_on',
  companion: 'site_companion_on',
  cursors: 'site_live_cursors_on',
}

const DEFAULTS: Settings = { sound: false, companion: false, cursors: false }

const SiteSettingsContext = createContext<{
  settings: Settings
  toggle: (key: SiteSettingKey) => void
}>({ settings: DEFAULTS, toggle: () => {} })

function readStored(): Settings {
  const next = { ...DEFAULTS }
  try {
    for (const key of Object.keys(STORAGE_KEYS) as SiteSettingKey[]) {
      next[key] = localStorage.getItem(STORAGE_KEYS[key]) === '1'
    }
  } catch {
    // Storage blocked (private mode etc.): everything stays off.
  }
  return next
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)

  useEffect(() => {
    // Read after mount so server and first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(readStored())
  }, [])

  const toggle = useCallback((key: SiteSettingKey) => {
    setSettings((prev) => {
      const value = !prev[key]
      try {
        localStorage.setItem(STORAGE_KEYS[key], value ? '1' : '0')
      } catch {
        // ignore
      }
      return { ...prev, [key]: value }
    })
  }, [])

  return <SiteSettingsContext.Provider value={{ settings, toggle }}>{children}</SiteSettingsContext.Provider>
}

export const useSiteSettings = () => useContext(SiteSettingsContext)
