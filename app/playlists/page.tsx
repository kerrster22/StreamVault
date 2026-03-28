'use client'

import { useState } from 'react'
import { ListVideo, Plus, Search, RefreshCw, Download } from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { TopBar } from '@/components/top-bar'
import { PlaylistCard } from '@/components/playlist-card'
import { ViewToggle } from '@/components/view-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockSavedPlaylists } from '@/lib/mock-data'

export default function PlaylistsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPlaylists = mockSavedPlaylists.filter(playlist =>
    playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.uploader.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalVideos = mockSavedPlaylists.reduce((acc, p) => acc + p.itemCount, 0)
  const downloadedVideos = mockSavedPlaylists.reduce((acc, p) => acc + p.downloadedCount, 0)

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <main className="flex-1 pl-64">
        <TopBar />
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Saved Playlists</h1>
              <p className="text-sm text-muted-foreground">
                {mockSavedPlaylists.length} playlists • {downloadedVideos}/{totalVideos} videos downloaded
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Sync All
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Playlist
              </Button>
            </div>
          </div>

          {/* Search and View Toggle */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search playlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 rounded-xl"
              />
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>

          {/* Playlists Grid */}
          {filteredPlaylists.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredPlaylists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  href={`/playlists/${playlist.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <ListVideo className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">No playlists saved</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Save playlists from YouTube or other sources
      </p>
      <Button className="mt-4 gap-2">
        <Plus className="h-4 w-4" />
        Add Your First Playlist
      </Button>
    </div>
  )
}
