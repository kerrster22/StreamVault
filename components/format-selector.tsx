'use client'

import { Check, Film, Music, FileVideo, HardDrive } from 'lucide-react'
import { formatFileSize } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { VideoFormat } from '@/lib/types'

interface FormatSelectorProps {
  formats: VideoFormat[]
  selectedFormat: string | null
  onSelect: (formatId: string) => void
}

export function FormatSelector({ formats, selectedFormat, onSelect }: FormatSelectorProps) {
  const videoFormats = formats.filter(f => f.video)
  const audioFormats = formats.filter(f => !f.video && f.audio)

  return (
    <div className="space-y-6">
      {/* Video Formats */}
      {videoFormats.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium text-foreground">Video Formats</h4>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {videoFormats.map((format) => (
              <FormatCard
                key={format.format_id}
                format={format}
                isSelected={selectedFormat === format.format_id}
                onSelect={() => onSelect(format.format_id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Audio Formats */}
      {audioFormats.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium text-foreground">Audio Only</h4>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {audioFormats.map((format) => (
              <FormatCard
                key={format.format_id}
                format={format}
                isSelected={selectedFormat === format.format_id}
                onSelect={() => onSelect(format.format_id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface FormatCardProps {
  format: VideoFormat
  isSelected: boolean
  onSelect: () => void
}

function FormatCard({ format, isSelected, onSelect }: FormatCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
        isSelected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border bg-card hover:border-primary/30 hover:bg-accent/50'
      )}
    >
      <div className={cn(
        'flex h-10 w-10 items-center justify-center rounded-lg',
        isSelected ? 'bg-primary/10' : 'bg-muted'
      )}>
        {format.video ? (
          <FileVideo className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
        ) : (
          <Music className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
        )}
      </div>
      
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{format.label}</span>
          {isSelected && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {format.resolution !== 'N/A' && <span>{format.resolution}</span>}
          <span className="uppercase">{format.ext}</span>
          <span className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {formatFileSize(format.filesize)}
          </span>
        </div>
      </div>
    </button>
  )
}
