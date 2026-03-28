'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LibraryShelfProps {
  title: string
  description?: string
  href?: string
  viewAllLabel?: string
  children: React.ReactNode
  className?: string
}

export function LibraryShelf({
  title,
  description,
  href,
  viewAllLabel = 'View All',
  children,
  className,
}: LibraryShelfProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {href && (
          <Button
            variant="ghost"
            asChild
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <Link href={href}>
              {viewAllLabel}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {children}
      </div>
    </section>
  )
}
