'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Play, Clock, MoreVertical, Download, Trash2, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDuration, formatFileSize, formatRelativeTime } from '@/lib/api'
import { cn } from '@/lib/utils'

interface MediaCardProps {
  id: string
  title: string
  thumbnail: string
  uploader?: string
  duration?: number
  filesize?: number
  quality?: string
  format?: string
  downloadedAt?: string
  href?: string
  showOverlay?: boolean
  className?: string
}

export function MediaCard({
  title,
  thumbnail,
  uploader,
  duration,
  filesize,
  quality,
  format,
  downloadedAt,
  href = '#',
  showOverlay = true,
  className,
}: MediaCardProps) {
  return (
    <div className={cn('group relative', className)}>
      <Link href={href} className="block">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          <Image
            src={thumbnail || '/placeholder.jpg'}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Gradient overlay */}
          {showOverlay && (
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          )}
          
          {/* Duration badge */}
          {duration && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 backdrop-blur-sm">
              <Clock className="h-3 w-3 text-foreground" />
              <span className="text-xs font-medium text-foreground">
                {formatDuration(duration)}
              </span>
            </div>
          )}
          
          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
              <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
            </div>
          </div>
          
          {/* Quality badge */}
          {quality && (
            <div className="absolute left-2 top-2 rounded-md bg-primary/90 px-1.5 py-0.5">
              <span className="text-xs font-semibold text-primary-foreground">{quality}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>
          {uploader && (
            <p className="text-xs text-muted-foreground">{uploader}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {filesize && <span>{formatFileSize(filesize)}</span>}
            {filesize && format && <span>•</span>}
            {format && <span>{format}</span>}
            {downloadedAt && (filesize || format) && <span>•</span>}
            {downloadedAt && <span>{formatRelativeTime(downloadedAt)}</span>}
          </div>
        </div>
      </Link>

      {/* Actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          >
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
          <DropdownMenuItem className="gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
