'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Radio, Video, MoreVertical, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRelativeTime } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { SavedChannel } from '@/lib/types'

interface ChannelCardProps {
  channel: SavedChannel
  href?: string
  className?: string
}

export function ChannelCard({ channel, href = '#', className }: ChannelCardProps) {
  return (
    <div className={cn('group relative', className)}>
      <Link href={href} className="block">
        {/* Banner */}
        <div className="relative h-20 overflow-hidden rounded-t-xl bg-muted">
          {channel.banner && (
            <Image
              src={channel.banner}
              alt={`${channel.title} banner`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        </div>

        {/* Content */}
        <div className="relative rounded-b-xl border border-t-0 border-border bg-card px-4 pb-4 pt-8">
          {/* Avatar */}
          <div className="absolute -top-6 left-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-card bg-muted ring-2 ring-background">
              <Image
                src={channel.thumbnail || '/placeholder.jpg'}
                alt={channel.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 font-medium text-foreground group-hover:text-primary transition-colors">
                {channel.title}
              </h3>
              {channel.monitoring && (
                <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                  <Radio className="h-3 w-3" />
                  Monitoring
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Video className="h-3 w-3" />
                {channel.videoCount} videos
              </span>
              <span>•</span>
              <span>Checked {formatRelativeTime(channel.lastChecked)}</span>
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
            className="absolute right-2 top-2 h-7 w-7 rounded-lg bg-background/70 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuItem className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Check for Updates
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Radio className="h-4 w-4" />
            {channel.monitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            Remove Channel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
