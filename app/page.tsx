'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { TopBar } from '@/components/top-bar'
import { HeroUrlInput } from '@/components/hero-url-input'
import { QuickStatsCards } from '@/components/quick-stats-cards'
import { LibraryShelf } from '@/components/library-shelf'
import { MediaCard } from '@/components/media-card'
import { DownloadQueueCard } from '@/components/download-queue-card'
import { ChannelCard } from '@/components/channel-card'
import { PlaylistCard } from '@/components/playlist-card'
import {
  mockActiveDownloads,
  mockLibraryItems,
  mockSavedChannels,
  mockSavedPlaylists,
} from '@/lib/mock-data'

export default function HomePage() {
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
          {mockActiveDownloads.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Active Downloads</h2>
                  <p className="text-sm text-muted-foreground">
                    {mockActiveDownloads.length} downloads in progress
                  </p>
                </div>
              </div>
              <div className="grid gap-4">
                {mockActiveDownloads.map((job) => (
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
            {mockLibraryItems.slice(0, 6).map((item) => (
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
              {mockSavedChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  href={`/channels/${channel.id}`}
                />
              ))}
            </div>
          </section>
          
          {/* Saved Playlists */}
          <LibraryShelf
            title="Saved Playlists"
            description="Track your learning progress"
            href="/playlists"
          >
            {mockSavedPlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                href={`/playlists/${playlist.id}`}
              />
            ))}
          </LibraryShelf>
        </div>
      </main>
    </div>
  )
}
