'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Search,
  SlidersHorizontal,
  Play,
  FolderOpen,
  Trash2,
  MoreVertical,
  Clock,
  HardDrive,
  Film,
  Music,
  Download,
} from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { TopBar } from '@/components/top-bar'
import { MediaCard } from '@/components/media-card'
import { ViewToggle } from '@/components/view-toggle'
import { FilterBar } from '@/components/filter-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { mockLibraryItems } from '@/lib/mock-data'
import { formatDuration, formatFileSize, formatRelativeTime } from '@/lib/api'
import { cn } from '@/lib/utils'

const filterOptions = [
  { id: 'all', label: 'All', count: mockLibraryItems.length },
  { id: 'video', label: 'Videos', count: mockLibraryItems.filter(i => i.format !== 'MP3').length },
  { id: 'audio', label: 'Audio', count: mockLibraryItems.filter(i => i.format === 'MP3').length },
  { id: 'recent', label: 'Recent' },
]

export default function LibraryPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')

  const filteredItems = mockLibraryItems.filter(item => {
    if (activeFilter === 'video') return item.format !== 'MP3'
    if (activeFilter === 'audio') return item.format === 'MP3'
    return true
  }).filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.uploader.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalSize = mockLibraryItems.reduce((acc, item) => acc + item.filesize, 0)

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <main className="flex-1 pl-64">
        <TopBar />
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Library</h1>
              <p className="text-sm text-muted-foreground">
                Your downloaded media collection
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                <span>{mockLibraryItems.length} items</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span>{formatFileSize(totalSize)}</span>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <FilterBar
              options={filterOptions}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 rounded-xl"
                />
              </div>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-xl">
                    <SlidersHorizontal className="h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => setSortBy('date')}>
                    Date Added
                    {sortBy === 'date' && <span className="ml-auto text-primary">*</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('title')}>
                    Title
                    {sortBy === 'title' && <span className="ml-auto text-primary">*</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('size')}>
                    File Size
                    {sortBy === 'size' && <span className="ml-auto text-primary">*</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('uploader')}>
                    Creator
                    {sortBy === 'uploader' && <span className="ml-auto text-primary">*</span>}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Toggle */}
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </div>

          {/* Content */}
          {filteredItems.length === 0 ? (
            <EmptyLibrary />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredItems.map((item) => (
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
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <LibraryListItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function LibraryListItem({ item }: { item: typeof mockLibraryItems[0] }) {
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/50">
      {/* Thumbnail */}
      <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Play className="h-6 w-6 text-foreground" fill="currentColor" />
        </div>
        <div className="absolute bottom-1 right-1 rounded bg-background/80 px-1 py-0.5 text-xs font-medium backdrop-blur-sm">
          {formatDuration(item.duration)}
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 font-medium text-foreground group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground">{item.uploader}</p>
      </div>

      {/* Meta */}
      <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
        <div className="flex items-center gap-1.5">
          {item.format === 'MP3' ? (
            <Music className="h-4 w-4" />
          ) : (
            <Film className="h-4 w-4" />
          )}
          <span>{item.format}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <HardDrive className="h-4 w-4" />
          <span>{formatFileSize(item.filesize)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{formatRelativeTime(item.downloadedAt)}</span>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {item.quality}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
          <Play className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem className="gap-2">
              <Play className="h-4 w-4" />
              Play
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Open Folder
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Download className="h-4 w-4" />
              Re-download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function EmptyLibrary() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Film className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">Your library is empty</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Download some media to start building your collection
      </p>
      <Button className="mt-4 gap-2">
        <Download className="h-4 w-4" />
        Start Downloading
      </Button>
    </div>
  )
}
