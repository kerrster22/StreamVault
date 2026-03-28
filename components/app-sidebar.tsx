'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Download,
  Library,
  ListVideo,
  Tv,
  History,
  FolderHeart,
  Settings,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/downloads', icon: Download, label: 'Downloads' },
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/playlists', icon: ListVideo, label: 'Playlists' },
  { href: '/channels', icon: Tv, label: 'Channels' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/collections', icon: FolderHeart, label: 'Collections' },
]

const bottomNavItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
            StreamVault
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Media Library
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <div className="mb-2 px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                )}
              />
              {item.label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-sidebar-border p-3">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                )}
              />
              {item.label}
            </Link>
          )
        })}
        
        {/* yt-dlp badge */}
        <div className="mt-4 rounded-xl bg-surface p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">
              Backend Online
            </span>
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground/70">
            Powered by yt-dlp + FFmpeg
          </p>
        </div>
      </div>
    </aside>
  )
}
