'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiGrid, FiFileText, FiUsers, FiMonitor, FiLogOut } from 'react-icons/fi'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <FiGrid className="h-5 w-5" /> },
  { href: '/admin/posts', label: 'Posts', icon: <FiFileText className="h-5 w-5" /> },
  { href: '/admin/visitors', label: 'Visitors', icon: <FiUsers className="h-5 w-5" /> },
  { href: '/admin/ads', label: 'Ads', icon: <FiMonitor className="h-5 w-5" /> },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-neutral-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-neutral-800 bg-neutral-950 sticky top-0 h-screen shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-neutral-800">
          <span className="text-lg font-bold text-white">Admin</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-neutral-800 px-2 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <FiLogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-3">
          <span className="text-base font-bold text-white">Admin</span>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
                    isActive
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                  title={item.label}
                >
                  {item.icon}
                </Link>
              )
            })}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center rounded-lg p-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
              title="Logout"
            >
              <FiLogOut className="h-5 w-5" />
            </button>
          </nav>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
