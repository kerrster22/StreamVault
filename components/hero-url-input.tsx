'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, Zap, ListPlus, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function HeroUrlInput() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleAnalyze = async () => {
    if (!url.trim()) return
    setIsAnalyzing(true)
    
    // Simulate analysis delay then navigate
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push(`/analyze?url=${encodeURIComponent(url)}`)
  }

  const handleQuickDownload = async () => {
    if (!url.trim()) return
    setIsAnalyzing(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    router.push(`/analyze?url=${encodeURIComponent(url)}&quick=true`)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Add New Media</h2>
            <p className="text-sm text-muted-foreground">
              Paste a video, playlist, or channel URL to get started
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div
          className={cn(
            'relative rounded-xl border-2 bg-input/30 transition-all duration-300',
            isFocused ? 'border-primary/50 shadow-lg shadow-primary/10' : 'border-border'
          )}
        >
          <div className="flex items-center gap-3 p-4">
            <Link2 className={cn(
              'h-5 w-5 transition-colors',
              isFocused ? 'text-primary' : 'text-muted-foreground'
            )} />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="https://youtube.com/watch?v=... or playlist or channel URL"
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            onClick={handleAnalyze}
            disabled={!url.trim() || isAnalyzing}
            className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Analyze Source
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleQuickDownload}
            disabled={!url.trim() || isAnalyzing}
            className="gap-2 rounded-xl"
          >
            <Zap className="h-4 w-4" />
            Quick Download
          </Button>
          
          <Button
            variant="outline"
            disabled={!url.trim() || isAnalyzing}
            className="gap-2 rounded-xl"
          >
            <ListPlus className="h-4 w-4" />
            Add to Queue
          </Button>
        </div>

        {/* Helper text */}
        <p className="mt-4 text-xs text-muted-foreground">
          Supports YouTube, Vimeo, and 1000+ other sites via yt-dlp
        </p>
      </div>
    </div>
  )
}
