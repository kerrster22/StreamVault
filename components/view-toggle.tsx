'use client'

import { Grid3X3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ViewToggleProps {
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/50 p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('grid')}
        className={cn(
          'h-8 w-8 p-0 rounded-md',
          view === 'grid' && 'bg-background shadow-sm'
        )}
      >
        <Grid3X3 className={cn('h-4 w-4', view === 'grid' ? 'text-foreground' : 'text-muted-foreground')} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('list')}
        className={cn(
          'h-8 w-8 p-0 rounded-md',
          view === 'list' && 'bg-background shadow-sm'
        )}
      >
        <List className={cn('h-4 w-4', view === 'list' ? 'text-foreground' : 'text-muted-foreground')} />
      </Button>
    </div>
  )
}
