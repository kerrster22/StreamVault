'use client'

import Image from 'next/image'
import { X, Pause, Play, RotateCcw, FolderOpen, AlertCircle, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatFileSize } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { DownloadJob } from '@/lib/types'

interface DownloadQueueCardProps {
  job: DownloadJob
  onCancel?: () => void
  onRetry?: () => void
  onPause?: () => void
  onResume?: () => void
  compact?: boolean
}

export function DownloadQueueCard({
  job,
  onCancel,
  onRetry,
  onPause,
  onResume,
  compact = false,
}: DownloadQueueCardProps) {
  const statusColors = {
    queued: 'bg-muted text-muted-foreground',
    downloading: 'bg-primary/10 text-primary',
    completed: 'bg-success/10 text-success',
    failed: 'bg-destructive/10 text-destructive',
    paused: 'bg-warning/10 text-warning',
  }

  const statusLabels = {
    queued: 'Queued',
    downloading: 'Downloading',
    completed: 'Completed',
    failed: 'Failed',
    paused: 'Paused',
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/50">
        {/* Thumbnail */}
        <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image
            src={job.thumbnail}
            alt={job.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-medium text-foreground">{job.title}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {job.status === 'downloading' && (
              <>
                <span>{job.progress}%</span>
                <span>•</span>
                <span>{job.speed}</span>
              </>
            )}
            {job.status === 'queued' && <span>Waiting...</span>}
            {job.status === 'completed' && <span>Complete</span>}
            {job.status === 'failed' && <span className="text-destructive">{job.error}</span>}
          </div>
        </div>

        {/* Progress */}
        {job.status === 'downloading' && (
          <div className="w-24">
            <Progress value={job.progress} className="h-1.5" />
          </div>
        )}

        {/* Status badge */}
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColors[job.status])}>
          {statusLabels[job.status]}
        </span>
      </div>
    )
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30">
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image
            src={job.thumbnail}
            alt={job.title}
            fill
            className="object-cover"
          />
          {job.quality && (
            <div className="absolute left-1.5 top-1.5 rounded bg-background/80 px-1.5 py-0.5 backdrop-blur-sm">
              <span className="text-xs font-medium">{job.quality}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 font-medium text-foreground">{job.title}</h3>
              <span className={cn('flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[job.status])}>
                {statusLabels[job.status]}
              </span>
            </div>
            
            {/* Meta info */}
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {job.format && <span>{job.format}</span>}
              {job.filesize && <span>{formatFileSize(job.filesize)}</span>}
              {job.status === 'downloading' && job.speed && (
                <span className="flex items-center gap-1 text-primary">
                  <Zap className="h-3 w-3" />
                  {job.speed}
                </span>
              )}
              {job.status === 'downloading' && job.eta && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {job.eta}s remaining
                </span>
              )}
            </div>

            {/* Error message */}
            {job.status === 'failed' && job.error && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{job.error}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {(job.status === 'downloading' || job.status === 'paused') && (
            <div className="mt-3">
              <Progress value={job.progress} className="h-2" />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>{job.progress}% complete</span>
                {job.filesize && (
                  <span>
                    {formatFileSize((job.filesize * job.progress) / 100)} / {formatFileSize(job.filesize)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          {job.status === 'downloading' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onPause}
              className="h-8 w-8 rounded-lg hover:bg-accent"
            >
              <Pause className="h-4 w-4" />
            </Button>
          )}
          {job.status === 'paused' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onResume}
              className="h-8 w-8 rounded-lg hover:bg-accent"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          {job.status === 'failed' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRetry}
              className="h-8 w-8 rounded-lg hover:bg-accent"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          {job.status === 'completed' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-accent"
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          )}
          {(job.status === 'queued' || job.status === 'downloading' || job.status === 'paused') && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
