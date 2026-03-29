'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { History, Search, Trash2, ExternalLink, RotateCcw, Video, ListVideo, Tv } from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { TopBar } from '@/components/top-bar'
import { StatusBadge, SourceTypeBadge } from '@/components/status-badge'
import { FilterBar } from '@/components/filter-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getHistory, formatRelativeTime } from '@/lib/api'
import type { HistoryEntry } from '@/lib/types'

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    getHistory().then(setHistory).catch(() => {})
  }, [])

  const filterOptions = [
    { id: 'all', label: 'All', count: history.length },
    { id: 'video', label: 'Videos' },
    { id: 'playlist', label: 'Playlists' },
    { id: 'channel', label: 'Channels' },
  ]

  const filteredHistory = history.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === 'all' || entry.sourceType === activeFilter
    return matchesSearch && matchesFilter
  })

  const groupedHistory = filteredHistory.reduce((groups, entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(entry)
    return groups
  }, {} as Record<string, HistoryEntry[]>)

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 pl-64">
        <TopBar />

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Download History</h1>
              <p className="text-sm text-muted-foreground">
                {history.length} total downloads
              </p>
            </div>
            <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              Clear History
            </Button>
          </div>

          {/* Filters */}
          <FilterBar
            options={filterOptions}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>

          {/* History Timeline */}
          {Object.keys(groupedHistory).length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedHistory).map(([date, entries]) => (
                <div key={date} className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">{date}</h3>
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <HistoryItem key={entry.id} entry={entry} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const SourceIcon = {
    video: Video,
    playlist: ListVideo,
    channel: Tv,
  }[entry.sourceType] ?? Video

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/50">
      <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {entry.thumbnail ? (
          <Image src={entry.thumbnail} alt={entry.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <SourceIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded bg-background/80 backdrop-blur-sm">
          <SourceIcon className="h-3 w-3" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-1 font-medium text-foreground">{entry.title}</h4>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatRelativeTime(entry.timestamp)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SourceTypeBadge type={entry.sourceType} />
        <StatusBadge status={entry.status} />
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
          <a href={entry.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <History className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">No download history</h3>
      <p className="mt-1 text-sm text-muted-foreground">Your download history will appear here</p>
    </div>
  )
}
