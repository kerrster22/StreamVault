'use client'

import { Download, HardDrive, Tv, ListVideo, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  subtext?: string
  trend?: {
    value: number
    positive: boolean
  }
  className?: string
}

function StatCard({ icon: Icon, label, value, subtext, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/30',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            trend.positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
          )}>
            <TrendingUp className={cn('h-3 w-3', !trend.positive && 'rotate-180')} />
            {trend.value}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {subtext && (
          <p className="mt-1 text-xs text-muted-foreground/70">{subtext}</p>
        )}
      </div>
    </div>
  )
}

export function QuickStatsCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        icon={Download}
        label="Active Downloads"
        value={2}
        subtext="67% avg progress"
      />
      <StatCard
        icon={HardDrive}
        label="Storage Used"
        value="247 GB"
        subtext="of 1 TB available"
        trend={{ value: 12, positive: true }}
      />
      <StatCard
        icon={Tv}
        label="Channels"
        value={3}
        subtext="2 monitoring"
      />
      <StatCard
        icon={ListVideo}
        label="Library Items"
        value={156}
        trend={{ value: 8, positive: true }}
      />
    </div>
  )
}

export function ActiveDownloadMini() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Download className="h-5 w-5 text-primary animate-pulse" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          How to Build a Media Server
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-primary">67%</span>
          <span>•</span>
          <span>12.4 MB/s</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            45s
          </span>
        </div>
      </div>
      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-[67%] rounded-full bg-primary" />
      </div>
    </div>
  )
}
