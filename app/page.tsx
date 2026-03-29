'use client'

import { useEffect, useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { TopBar } from '@/components/top-bar'
import { HeroUrlInput } from '@/components/hero-url-input'
import { QuickStatsCards } from '@/components/quick-stats-cards'
import { LibraryShelf } from '@/components/library-shelf'
import { MediaCard } from '@/components/media-card'
import { DownloadQueueCard } from '@/components/download-queue-card'
import { ChannelCard } from '@/components/channel-card'
import { PlaylistCard } from '@/components/playlist-card'
import { getDownloads, getLibrary, getChannels, getPlaylists } from '@/lib/api'
import type { DownloadJob, LibraryItem, SavedChannel, SavedPlaylist } from '@/lib/types'

export default function HomePage() {
  const [activeDownloads, setActiveDownloads] = useState<DownloadJob[]>([])
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([])
  const [channels, setChannels] = useState<SavedChannel[]>([])
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([])

  useEffect(() => {
    Promise.all([
      getDownloads().catch(() => null),
      getLibrary().catch(() => [] as typeof libraryItems),
      getChannels().catch(() => [] as typeof channels),
      getPlaylists().catch(() => [] as typeof playlists),
    ]).then(([downloads, library, ch, pl]) => {
      if (downloads) setActiveDownloads(downloads.active)
      setLibraryItems(library)
      setChannels(ch)
      setPlaylists(pl)
    })
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 pl-64">
        <TopBar />

        <div className="p-6 space-y-8">
          {/* Hero URL Input */}
          <HeroUrlInput />

          {/* Quick Stats */}
          <QuickStatsCards />

          {/* Active Downloads */}
          {activeDownloads.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Active Downloads</h2>
                  <p className="text-sm text-muted-foreground">
                    {activeDownloads.length} downloads in progress
                  </p>
                </div>
              </div>
              <div className="grid gap-4">
                {activeDownloads.map((job) => (
                  <DownloadQueueCard key={job.jobId} job={job} />
                ))}
              </div>
            </section>
          )}

          {/* Recently Added */}
          <LibraryShelf
            title="Recently Added"
            description="Your latest downloads"
            href="/library"
          >
            {libraryItems.slice(0, 6).map((item) => (
              <MediaCard
                key={item.id}
                id={item.id}
                title={item.title}
                thumbnail={item.thumbnail}
                uploader={item.uploader}
                duration={item.duration}
                filesize={item.filesize}
                quality={item.quality}
                format={item.format}
                downloadedAt={item.downloadedAt}
                href={`/library/${item.id}`}
              />
            ))}
          </LibraryShelf>

          {/* Saved Channels */}
          {channels.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Saved Channels</h2>
                  <p className="text-sm text-muted-foreground">
                    Channels you&apos;re following
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {channels.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    href={`/channels/${channel.id}`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Saved Playlists */}
          {playlists.length > 0 && (
            <LibraryShelf
              title="Saved Playlists"
              description="Track your learning progress"
              href="/playlists"
            >
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  href={`/playlists/${playlist.id}`}
                />
              ))}
            </LibraryShelf>
          )}
        </div>
      </main>
    </div>
  )
}
