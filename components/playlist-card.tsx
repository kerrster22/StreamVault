'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ListVideo, Download, MoreVertical, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRelativeTime } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { SavedPlaylist } from '@/lib/types'

interface PlaylistCardProps {
  playlist: SavedPlaylist
  href?: string
  className?: string
}

export function PlaylistCard({ playlist, href = '#', className }: PlaylistCardProps) {
  const downloadProgress = (playlist.downloadedCount / playlist.itemCount) * 100
  const isComplete = playlist.downloadedCount === playlist.itemCount

  return (
    <div className={cn('group relative', className)}>
      <Link href={href} className="block">
        {/* Thumbnail with stack effect */}
        <div className="relative">
          <div className="absolute -right-1 -top-1 h-full w-full rounded-xl bg-muted/50" />
          <div className="absolute -right-2 -top-2 h-full w-full rounded-xl bg-muted/30" />
          <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
            <Image
              src={playlist.thumbnail || '/placeholder.jpg'}
              alt={playlist.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            
            {/* Item count badge */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-background/80 px-2 py-1 backdrop-blur-sm">
              <ListVideo className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{playlist.itemCount} videos</span>
            </div>

            {/* Complete badge */}
            {isComplete && (
              <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-success/90 px-2 py-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-success-foreground" />
                <span className="text-xs font-medium text-success-foreground">Complete</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 space-y-2">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {playlist.title}
          </h3>
          <p className="text-xs text-muted-foreground">{playlist.uploader}</p>
          
          {/* Download progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Download className="h-3 w-3" />
                {playlist.downloadedCount} / {playlist.itemCount}
              </span>
              <span className="text-muted-foreground">
                {formatRelativeTime(playlist.lastSynced)}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  isComplete ? 'bg-success' : 'bg-primary'
                )}
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        </div>
      </Link>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-7 w-7 rounded-lg bg-background/70 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuItem className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync Playlist
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Download className="h-4 w-4" />
            Download All
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            Remove Playlist
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
