'use client'

import { cn } from '@/lib/utils'

interface FilterOption {
  id: string
  label: string
  count?: number
}

interface FilterBarProps {
  options: FilterOption[]
  activeFilter: string
  onFilterChange: (filterId: string) => void
  className?: string
}

export function FilterBar({ options, activeFilter, onFilterChange, className }: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onFilterChange(option.id)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
            activeFilter === option.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-xs',
                activeFilter === option.id
                  ? 'bg-primary-foreground/20'
                  : 'bg-muted-foreground/20'
              )}
            >
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
