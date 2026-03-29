'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Download,
  Music,
  Bookmark,
  Loader2,
  CheckCircle2,
  Radio,
  ArrowLeft,
  Play,
  Clock,
  AlertTriangle,
  Lock,
  Ban,
} from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { TopBar } from '@/components/top-bar'
import { SourceHeader } from '@/components/source-header'
import { FormatSelector } from '@/components/format-selector'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { analyzeUrl, startDownload, saveChannel, savePlaylist, formatDuration, ApiRequestError } from '@/lib/api'
import type { ApiError, ApiErrorCode } from '@/lib/api'
import type { AnalyzeResponse, VideoEntry } from '@/lib/types'

// Per-code UI copy. Shown instead of the raw backend message for known error codes.
// The backend message stays technical (good for logs); this is what the user sees.
const ERROR_UI: Record<ApiErrorCode, { heading: string; body: string }> = {
  AUTH_REQUIRED: {
    heading: 'Authentication required',
    body: "YouTube is blocking this request. For videos, a sign-in cookies file is needed. For playlists or channels, this may be YouTube's auth pre-check — check that YTDLP_SKIP_YOUTUBETAB_AUTHCHECK is enabled in your backend config, or add a cookies file.",
  },
  RATE_LIMITED: {
    heading: 'Too many requests',
    body: 'YouTube is temporarily throttling requests from this server.',
  },
  EXTRACTION_FAILED: {
    heading: 'Could not extract source',
    body: 'This content could not be loaded. It may be private, deleted, or unavailable in your region.',
  },
  UNSUPPORTED_SOURCE: {
    heading: 'Unsupported source',
    body: "This URL isn't supported by yt-dlp. Check that it points to a valid video, playlist, or channel.",
  },
  INVALID_URL: {
    heading: 'Invalid URL',
    body: "The URL doesn't appear to be valid. Double-check it and try again.",
  },
  VALIDATION_ERROR: {
    heading: 'Invalid request',
    body: 'The request was rejected by the server. Check the URL format.',
  },
  INTERNAL_ERROR: {
    heading: 'Something went wrong',
    body: 'An unexpected server error occurred. Check the backend logs for details.',
  },
}

function AnalyzeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const url = searchParams.get('url') || ''
  
  const [isLoading, setIsLoading] = useState(true)
  const [source, setSource] = useState<AnalyzeResponse | null>(null)
  const [analyzeError, setAnalyzeError] = useState<ApiError | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set())
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    async function analyze() {
      if (!url) return
      setIsLoading(true)
      try {
        const result = await analyzeUrl({ url })
        setSource(result)
        // Auto-select first format for videos
        if (result.type === 'video' && result.formats.length > 0) {
          setSelectedFormat(result.formats[0].format_id)
        }
        // Auto-select all entries for playlists/channels
        if (result.type === 'playlist' || result.type === 'channel') {
          setSelectedEntries(new Set(result.entries.map(e => e.id)))
        }
      } catch (error) {
        console.error('Analysis failed:', error)
        if (error instanceof ApiRequestError) {
          // Use the structured payload when present; fall back to a generic INTERNAL_ERROR
          // so the error UI always has a code to branch on.
          setAnalyzeError(
            error.apiError ?? { code: 'INTERNAL_ERROR', message: error.message }
          )
        } else {
          setAnalyzeError({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' })
        }
      } finally {
        setIsLoading(false)
      }
    }
    analyze()
  }, [url])

  const handleDownload = async (mode: 'video' | 'audio' = 'video') => {
    if (!source) return
    setIsDownloading(true)
    try {
      const formatId = mode === 'audio' ? 'bestaudio' : (selectedFormat || 'best')
      await startDownload({
        url,
        sourceType: source.type,
        formatId,
        mode,
        selectedEntries: selectedEntries.size > 0 ? Array.from(selectedEntries) : undefined,
      })
      router.push('/downloads')
    } catch (err) {
      console.error('Failed to start download:', err)
      setIsDownloading(false)
    }
  }

  const toggleEntry = (id: string) => {
    const newSelected = new Set(selectedEntries)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedEntries(newSelected)
  }

  const toggleAllEntries = (entries: VideoEntry[]) => {
    if (selectedEntries.size === entries.length) {
      setSelectedEntries(new Set())
    } else {
      setSelectedEntries(new Set(entries.map(e => e.id)))
    }
  }

  const handleSave = async () => {
    if (!source || isSaved) return
    try {
      if (source.type === 'channel') {
        await saveChannel({
          channelId: source.id,
          title: source.title,
          thumbnail: source.thumbnail,
          banner: source.banner,
          monitoring: false,
          url,
        })
      } else if (source.type === 'playlist') {
        await savePlaylist({
          playlistId: source.id,
          title: source.title,
          thumbnail: source.thumbnail,
          uploader: source.uploader,
          itemCount: source.entryCount,
          url,
        })
      }
      setIsSaved(true)
    } catch (err) {
      console.error('Failed to save:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Analyzing Source</h2>
            <p className="text-sm text-muted-foreground">Fetching metadata with yt-dlp...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!source) {
    const code = analyzeError?.code ?? 'INTERNAL_ERROR'
    const ui = ERROR_UI[code] ?? ERROR_UI.INTERNAL_ERROR
    const isAuth = code === 'AUTH_REQUIRED'
    const isRateLimit = code === 'RATE_LIMITED'
    const Icon = isAuth ? Lock : isRateLimit ? Ban : AlertTriangle
    const actionText = analyzeError?.suggestedAction

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <Icon className="h-7 w-7 text-destructive" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">{ui.heading}</h2>
            <p className="text-sm text-muted-foreground">{ui.body}</p>
          </div>
          {actionText && (
            <div className="rounded-lg bg-muted px-4 py-3 text-left text-sm text-muted-foreground">
              <span className="font-medium text-foreground">What to do: </span>
              {actionText}
            </div>
          )}
          <Button onClick={() => router.push('/')} className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            Try Another URL
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <main className="flex-1 pl-64">
        <TopBar />
        
        <div className="p-6 space-y-6">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          {/* Source Header */}
          <SourceHeader source={source} />

          {/* Video Source */}
          {source.type === 'video' && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Format Selection */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Select Format</h2>
                <div className="rounded-xl border border-border bg-card p-4">
                  <FormatSelector
                    formats={source.formats}
                    selectedFormat={selectedFormat}
                    onSelect={setSelectedFormat}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Actions</h2>
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <Button
                    onClick={() => handleDownload('video')}
                    disabled={!selectedFormat || isDownloading}
                    className="w-full gap-2"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download Video
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full gap-2"
                    disabled={isDownloading}
                    onClick={() => handleDownload('audio')}
                  >
                    <Music className="h-4 w-4" />
                    Extract Audio
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Playlist Source */}
          {source.type === 'playlist' && (
            <div className="space-y-6">
              {/* Actions bar */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedEntries.size === source.entries.length}
                    onCheckedChange={() => toggleAllEntries(source.entries)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedEntries.size} of {source.entries.length} selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload('video')}
                    disabled={selectedEntries.size === 0 || isDownloading}
                    className="gap-2"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download Selected
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={handleSave} disabled={isSaved}>
                    <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Saved' : 'Save Playlist'}
                  </Button>
                </div>
              </div>

              {/* Video list */}
              <div className="space-y-2">
                {source.entries.map((entry, index) => (
                  <PlaylistEntry
                    key={entry.id}
                    entry={entry}
                    index={index + 1}
                    isSelected={selectedEntries.has(entry.id)}
                    onToggle={() => toggleEntry(entry.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Channel Source */}
          {source.type === 'channel' && (
            <div className="space-y-6">
              {/* Channel actions */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="gap-2" onClick={handleSave} disabled={isSaved}>
                    <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Saved' : 'Save Channel'}
                  </Button>
                  <Button variant="outline" className="gap-2" disabled>
                    <Radio className="h-4 w-4" />
                    Monitor for New Videos
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>{source.entryCount} videos available</span>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="videos" className="space-y-4">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                  <TabsTrigger value="playlists">Playlists</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                </TabsList>

                <TabsContent value="videos" className="space-y-4">
                  {/* Selection bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedEntries.size === source.entries.length}
                        onCheckedChange={() => toggleAllEntries(source.entries)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {selectedEntries.size} of {source.entries.length} selected
                      </span>
                    </div>
                    <Button
                      onClick={() => handleDownload('video')}
                      disabled={selectedEntries.size === 0 || isDownloading}
                      className="gap-2"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Download Selected
                    </Button>
                  </div>

                  {/* Video grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {source.entries.map((entry) => (
                      <ChannelVideoCard
                        key={entry.id}
                        entry={entry}
                        isSelected={selectedEntries.has(entry.id)}
                        onToggle={() => toggleEntry(entry.id)}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="playlists">
                  <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <p className="text-muted-foreground">No playlists found for this channel</p>
                  </div>
                </TabsContent>

                <TabsContent value="about">
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold text-foreground mb-2">About {source.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      This channel has {source.entryCount} videos available for download.
                      {source.subscriberCount && ` ${source.subscriberCount} subscribers.`}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function PlaylistEntry({
  entry,
  index,
  isSelected,
  onToggle,
}: {
  entry: VideoEntry
  index: number
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/50">
      <Checkbox checked={isSelected} onCheckedChange={onToggle} />
      <span className="w-8 text-center text-sm text-muted-foreground">{index}</span>
      <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {entry.thumbnail && <Image src={entry.thumbnail} alt={entry.title} fill className="object-cover" />}
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Play className="h-6 w-6 text-foreground" fill="currentColor" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-1 font-medium text-foreground">{entry.title}</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDuration(entry.duration)}
        </div>
      </div>
      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  )
}

function ChannelVideoCard({
  entry,
  isSelected,
  onToggle,
}: {
  entry: VideoEntry
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <div className="group relative rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/30">
      <div className="relative aspect-video bg-muted">
        {entry.thumbnail && <Image src={entry.thumbnail} alt={entry.title} fill className="object-cover" />}
        <div className="absolute bottom-2 right-2 rounded-md bg-background/80 px-1.5 py-0.5 backdrop-blur-sm">
          <span className="text-xs font-medium">{formatDuration(entry.duration)}</span>
        </div>
        <div className="absolute left-2 top-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            className="bg-background/80 backdrop-blur-sm"
          />
        </div>
      </div>
      <div className="p-3">
        <h4 className="line-clamp-2 text-sm font-medium text-foreground">{entry.title}</h4>
        {entry.publishDate && (
          <p className="mt-1 text-xs text-muted-foreground">{entry.publishDate}</p>
        )}
      </div>
    </div>
  )
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <AnalyzeContent />
    </Suspense>
  )
}
