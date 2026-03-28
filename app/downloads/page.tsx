'use client'

import { useState } from 'react'
import {
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Trash2,
  RotateCcw,
  Filter,
  ArrowUpDown,
} from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { TopBar } from '@/components/top-bar'
import { DownloadQueueCard } from '@/components/download-queue-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  mockActiveDownloads,
  mockQueuedDownloads,
  mockCompletedDownloads,
  mockFailedDownloads,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function DownloadsPage() {
  const [activeTab, setActiveTab] = useState('all')

  const allDownloads = [
    ...mockActiveDownloads,
    ...mockQueuedDownloads,
    ...mockCompletedDownloads,
    ...mockFailedDownloads,
  ]

  const stats = [
    {
      label: 'Active',
      value: mockActiveDownloads.length,
      icon: Download,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Queued',
      value: mockQueuedDownloads.length,
      icon: Clock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    {
      label: 'Completed',
      value: mockCompletedDownloads.length,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Failed',
      value: mockFailedDownloads.length,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ]

  const getFilteredDownloads = () => {
    switch (activeTab) {
      case 'active':
        return mockActiveDownloads
      case 'queued':
        return mockQueuedDownloads
      case 'completed':
        return mockCompletedDownloads
      case 'failed':
        return mockFailedDownloads
      default:
        return allDownloads
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <main className="flex-1 pl-64">
        <TopBar />
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Downloads</h1>
              <p className="text-sm text-muted-foreground">
                Manage your download queue and history
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Pause className="h-4 w-4" />
                Pause All
              </Button>
              <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                Clear Completed
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <button
                key={stat.label}
                onClick={() => setActiveTab(stat.label.toLowerCase())}
                className={cn(
                  'flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30',
                  activeTab === stat.label.toLowerCase() && 'border-primary ring-2 ring-primary/20'
                )}
              >
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', stat.bgColor)}>
                  <stat.icon className={cn('h-6 w-6', stat.color)} />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Tabs and Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="all">All ({allDownloads.length})</TabsTrigger>
                <TabsTrigger value="active">Active ({mockActiveDownloads.length})</TabsTrigger>
                <TabsTrigger value="queued">Queued ({mockQueuedDownloads.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({mockCompletedDownloads.length})</TabsTrigger>
                <TabsTrigger value="failed">Failed ({mockFailedDownloads.length})</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem>Videos Only</DropdownMenuItem>
                    <DropdownMenuItem>Audio Only</DropdownMenuItem>
                    <DropdownMenuItem>Playlists</DropdownMenuItem>
                    <DropdownMenuItem>Channels</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem>Newest First</DropdownMenuItem>
                    <DropdownMenuItem>Oldest First</DropdownMenuItem>
                    <DropdownMenuItem>By Name</DropdownMenuItem>
                    <DropdownMenuItem>By Size</DropdownMenuItem>
                    <DropdownMenuItem>By Progress</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Download List */}
            <TabsContent value={activeTab} className="space-y-3">
              {getFilteredDownloads().length === 0 ? (
                <EmptyState tab={activeTab} />
              ) : (
                getFilteredDownloads().map((job) => (
                  <DownloadQueueCard
                    key={job.jobId}
                    job={job}
                    onCancel={() => console.log('Cancel', job.jobId)}
                    onRetry={() => console.log('Retry', job.jobId)}
                    onPause={() => console.log('Pause', job.jobId)}
                    onResume={() => console.log('Resume', job.jobId)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function EmptyState({ tab }: { tab: string }) {
  const states: Record<string, { icon: typeof Download; title: string; description: string }> = {
    all: {
      icon: Download,
      title: 'No downloads yet',
      description: 'Add a URL from the home page to start downloading',
    },
    active: {
      icon: Play,
      title: 'No active downloads',
      description: 'All downloads are either completed or queued',
    },
    queued: {
      icon: Clock,
      title: 'Queue is empty',
      description: 'Add more items to your download queue',
    },
    completed: {
      icon: CheckCircle2,
      title: 'No completed downloads',
      description: 'Completed downloads will appear here',
    },
    failed: {
      icon: XCircle,
      title: 'No failed downloads',
      description: 'Failed downloads will appear here for retry',
    },
  }

  const state = states[tab] || states.all
  const Icon = state.icon

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{state.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{state.description}</p>
      {tab !== 'completed' && tab !== 'failed' && (
        <Button className="mt-4 gap-2">
          <Download className="h-4 w-4" />
          Add Download
        </Button>
      )}
      {tab === 'failed' && (
        <Button variant="outline" className="mt-4 gap-2">
          <RotateCcw className="h-4 w-4" />
          Retry All Failed
        </Button>
      )}
    </div>
  )
}
