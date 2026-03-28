'use client'

import { FolderHeart, Plus, MoreVertical, Trash2, Edit2 } from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { TopBar } from '@/components/top-bar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const mockCollections = [
  {
    id: '1',
    name: 'Learning Resources',
    itemCount: 24,
    color: 'bg-primary',
  },
  {
    id: '2',
    name: 'Music Videos',
    itemCount: 12,
    color: 'bg-chart-2',
  },
  {
    id: '3',
    name: 'Documentaries',
    itemCount: 8,
    color: 'bg-chart-5',
  },
  {
    id: '4',
    name: 'Tutorials',
    itemCount: 32,
    color: 'bg-chart-4',
  },
]

export default function CollectionsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <main className="flex-1 pl-64">
        <TopBar />
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Collections</h1>
              <p className="text-sm text-muted-foreground">
                Organize your media into custom collections
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Collection
            </Button>
          </div>

          {/* Collections Grid */}
          {mockCollections.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {mockCollections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
              
              {/* Add New Card */}
              <button className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card transition-colors hover:border-primary/50 hover:bg-accent/50">
                <Plus className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-sm font-medium text-muted-foreground">
                  New Collection
                </span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function CollectionCard({ collection }: { collection: typeof mockCollections[0] }) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-lg">
      {/* Icon */}
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${collection.color}/10`}>
        <FolderHeart className={`h-6 w-6 ${collection.color.replace('bg-', 'text-')}`} />
      </div>

      {/* Info */}
      <div className="mt-4">
        <h3 className="font-medium text-foreground">{collection.name}</h3>
        <p className="text-sm text-muted-foreground">{collection.itemCount} items</p>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuItem className="gap-2">
            <Edit2 className="h-4 w-4" />
            Rename
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <FolderHeart className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">No collections yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Create collections to organize your media
      </p>
      <Button className="mt-4 gap-2">
        <Plus className="h-4 w-4" />
        Create Your First Collection
      </Button>
    </div>
  )
}
