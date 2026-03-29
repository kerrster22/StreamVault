'use client'

import Image from 'next/image'
import { Clock, Calendar, User, Video, ListVideo, Tv } from 'lucide-react'
import { formatDuration } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { VideoSource, PlaylistSource, ChannelSource } from '@/lib/types'

interface SourceHeaderProps {
  source: VideoSource | PlaylistSource | ChannelSource
  className?: string
}

export function SourceHeader({ source, className }: SourceHeaderProps) {
  if (source.type === 'video') {
    return <VideoHeader source={source} className={className} />
  }
  
  if (source.type === 'playlist') {
    return <PlaylistHeader source={source} className={className} />
  }
  
  return <ChannelHeader source={source} className={className} />
}

function VideoHeader({ source, className }: { source: VideoSource; className?: string }) {
  return (
    <div className={cn('flex gap-6', className)}>
      {/* Thumbnail */}
      <div className="relative aspect-video w-80 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image
          src={source.thumbnail || '/placeholder.jpg'}
          alt={source.title}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-0.5 backdrop-blur-sm">
          <span className="text-sm font-medium">{formatDuration(source.duration)}</span>
        </div>
      </div>
      
      {/* Info */}
      <div className="flex flex-col justify-center space-y-3">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Video</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{source.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {source.uploader}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {formatDuration(source.duration)}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {source.publishDate}
          </span>
        </div>
        {source.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {source.description}
          </p>
        )}
      </div>
    </div>
  )
}

function PlaylistHeader({ source, className }: { source: PlaylistSource; className?: string }) {
  return (
    <div className={cn('flex gap-6', className)}>
      {/* Thumbnail with stack effect */}
      <div className="relative w-64 flex-shrink-0">
        <div className="absolute -right-2 -top-2 h-full w-full rounded-xl bg-muted/50" />
        <div className="absolute -right-4 -top-4 h-full w-full rounded-xl bg-muted/30" />
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          <Image
            src={source.thumbnail || '/placeholder.jpg'}
            alt={source.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-background/80 px-2 py-1 backdrop-blur-sm">
            <ListVideo className="h-4 w-4" />
            <span className="text-sm font-medium">{source.entryCount} videos</span>
          </div>
        </div>
      </div>
      
      {/* Info */}
      <div className="flex flex-col justify-center space-y-3">
        <div className="flex items-center gap-2">
          <ListVideo className="h-4 w-4 text-chart-2" />
          <span className="text-sm font-medium text-chart-2">Playlist</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{source.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {source.uploader}
          </span>
          <span className="flex items-center gap-1.5">
            <Video className="h-4 w-4" />
            {source.entryCount} videos
          </span>
        </div>
      </div>
    </div>
  )
}

function ChannelHeader({ source, className }: { source: ChannelSource; className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Banner */}
      <div className="relative h-40 overflow-hidden rounded-xl bg-muted">
        {source.banner && (
          <Image
            src={source.banner}
            alt={`${source.title} banner`}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
      
      {/* Channel Info */}
      <div className="flex items-center gap-4">
        <div className="relative -mt-12 h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-muted">
          <Image
            src={source.thumbnail || '/placeholder.jpg'}
            alt={source.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Tv className="h-4 w-4 text-chart-5" />
            <span className="text-sm font-medium text-chart-5">Channel</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{source.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {source.subscriberCount && (
              <span>{source.subscriberCount} subscribers</span>
            )}
            <span>{source.entryCount} videos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
