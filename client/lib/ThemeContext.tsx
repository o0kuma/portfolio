'use client'
import { createContext, useContext } from 'react'

// The site is dark-only (see app/layout.tsx). The context is kept so existing
// consumers keep compiling; `toggle` is intentionally a no-op.
type Theme = 'dark'
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
