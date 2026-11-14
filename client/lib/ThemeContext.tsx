'use client'
import { createContext, useContext } from 'react'

// The site is light paper only (see app/layout.tsx). The context is kept so existing
// consumers keep compiling; `toggle` is intentionally a no-op.
type Theme = 'light'
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: 'light', toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
