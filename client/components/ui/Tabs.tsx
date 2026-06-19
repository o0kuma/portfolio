'use client'

import { createContext, useContext, useState } from 'react'
import { motion } from 'framer-motion'

type TabsContextType = { active: string; setActive: (v: string) => void }
const TabsContext = createContext<TabsContextType>({ active: '', setActive: () => {} })

type TabsProps = { defaultValue: string; children: React.ReactNode; className?: string }

export function Tabs({ defaultValue, children, className = '' }: TabsProps) {
  const [active, setActive] = useState(defaultValue)
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="tablist" className={`flex items-center gap-1 border-b border-neutral-800 ${className}`}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const { active, setActive } = useContext(TabsContext)
  const isActive = active === value
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(value)}
      className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
        isActive ? 'text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'
      }`}
    >
      {children}
      {isActive && (
        <motion.span
          layoutId="tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-100"
        />
      )}
    </button>
  )
}

export function TabsContent({ value, children, className = '' }: { value: string; children: React.ReactNode; className?: string }) {
  const { active } = useContext(TabsContext)
  if (active !== value) return null
  return (
    <motion.div
      key={value}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
