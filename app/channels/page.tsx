'use client'

import { useState } from 'react'
import { Tv, Plus, Search, RefreshCw, Radio } from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { TopBar } from '@/components/top-bar'
import { ChannelCard } from '@/components/channel-card'
import { ViewToggle } from '@/components/view-toggle'
import { FilterBar } from '@/components/filter-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockSavedChannels } from '@/lib/mock-data'

const filterOptions = [
  { id: 'all', label: 'All', count: mockSavedChannels.length },
  { id: 'monitoring', label: 'Monitoring', count: mockSavedChannels.filter(c => c.monitoring).length },
  { id: 'not-monitoring', label: 'Not Monitoring', count: mockSavedChannels.filter(c => !c.monitoring).length },
]

export default function ChannelsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredChannels = mockSavedChannels.filter(channel => {
    const matchesSearch = channel.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = 
      activeFilter === 'all' ||
      (activeFilter === 'monitoring' && channel.monitoring) ||
      (activeFilter === 'not-monitoring' && !channel.monitoring)
    return matchesSearch && matchesFilter
  })

  const monitoringCount = mockSavedChannels.filter(c => c.monitoring).length

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <main className="flex-1 pl-64">
        <TopBar />
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Saved Channels</h1>
              <p className="text-sm text-muted-foreground">
                {mockSavedChannels.length} channels • {monitoringCount} monitoring
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Check All
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Channel
              </Button>
            </div>
          </div>

          {/* Filters */}
          <FilterBar
            options={filterOptions}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {/* Search and View Toggle */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 rounded-xl"
              />
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>

          {/* Channels Grid */}
          {filteredChannels.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  href={`/channels/${channel.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Tv className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">No channels saved</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Save channels to track new uploads
      </p>
      <Button className="mt-4 gap-2">
        <Plus className="h-4 w-4" />
        Add Your First Channel
      </Button>
    </div>
  )
}
