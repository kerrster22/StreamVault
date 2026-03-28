'use client'

import { cn } from '@/lib/utils'
import type { DownloadStatus, SourceType } from '@/lib/types'

interface StatusBadgeProps {
  status: DownloadStatus
  className?: string
}

const statusConfig: Record<DownloadStatus, { label: string; className: string }> = {
  queued: {
    label: 'Queued',
    className: 'bg-muted text-muted-foreground',
  },
  downloading: {
    label: 'Downloading',
    className: 'bg-primary/10 text-primary',
  },
  completed: {
    label: 'Completed',
    className: 'bg-success/10 text-success',
  },
  failed: {
    label: 'Failed',
    className: 'bg-destructive/10 text-destructive',
  },
  paused: {
    label: 'Paused',
    className: 'bg-warning/10 text-warning',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

interface SourceTypeBadgeProps {
  type: SourceType
  className?: string
}

const sourceTypeConfig: Record<SourceType, { label: string; className: string }> = {
  video: {
    label: 'Video',
    className: 'bg-info/10 text-info',
  },
  playlist: {
    label: 'Playlist',
    className: 'bg-chart-2/10 text-chart-2',
  },
  channel: {
    label: 'Channel',
    className: 'bg-chart-5/10 text-chart-5',
  },
}

export function SourceTypeBadge({ type, className }: SourceTypeBadgeProps) {
  const config = sourceTypeConfig[type]
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
