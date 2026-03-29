import type {
  AnalyzeRequest,
  AnalyzeResponse,
  DownloadRequest,
  DownloadResponse,
  DownloadJob,
  LibraryItem,
  SavedChannel,
  SavedPlaylist,
  HistoryEntry,
  JobStatusResponse,
} from './types'

// API base — Next.js rewrites /api/* to the FastAPI backend automatically.
// Override with NEXT_PUBLIC_API_URL if you're running the frontend outside Docker.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

export type ApiErrorCode =
  | 'INVALID_URL'
  | 'VALIDATION_ERROR'
  | 'EXTRACTION_FAILED'
  | 'AUTH_REQUIRED'
  | 'RATE_LIMITED'
  | 'UNSUPPORTED_SOURCE'
  | 'INTERNAL_ERROR'

export interface ApiError {
  code: ApiErrorCode
  message: string
  details?: Record<string, unknown>
  suggestedAction?: string
}

export class ApiRequestError extends Error {
  readonly status: number
  /** Structured error code from the backend, or null for plain HTTP errors. */
  readonly code: ApiErrorCode | null
  readonly details: Record<string, unknown> | undefined
  readonly suggestedAction: string | undefined
  /** Full structured payload — use this when you need the raw backend shape. */
  readonly apiError: ApiError | null

  constructor(status: number, message: string, apiError: ApiError | null = null) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.apiError = apiError
    this.code = apiError?.code ?? null
    this.details = apiError?.details
    this.suggestedAction = apiError?.suggestedAction
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    let apiError: ApiError | null = null
    try {
      const body = await res.json()
      if (body.error?.code) {
        // Structured error from analyze route
        apiError = body.error as ApiError
        message = apiError.message
      } else if (body.detail) {
        message = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)
      }
    } catch {}
    throw new ApiRequestError(res.status, message, apiError)
  }
  return res.json() as Promise<T>
}

/**
 * Analyze a URL and return metadata
 * POST /api/analyze
 */
export async function analyzeUrl(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  return apiFetch<AnalyzeResponse>('/analyze', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/**
 * Start a download job
 * POST /api/download
 */
export async function startDownload(request: DownloadRequest): Promise<DownloadResponse> {
  return apiFetch<DownloadResponse>('/download', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/**
 * Get job status (live — backed by Redis in the API)
 * GET /api/jobs/:id
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  return apiFetch<JobStatusResponse>(`/jobs/${jobId}`)
}

/**
 * Get all download jobs grouped by status
 * GET /api/jobs
 */
export async function getDownloads(): Promise<{
  active: DownloadJob[]
  queued: DownloadJob[]
  completed: DownloadJob[]
  failed: DownloadJob[]
}> {
  return apiFetch<{ active: DownloadJob[]; queued: DownloadJob[]; completed: DownloadJob[]; failed: DownloadJob[] }>('/jobs')
}

/**
 * Cancel a download job
 * DELETE /api/jobs/:id
 */
export async function cancelDownload(jobId: string): Promise<void> {
  await apiFetch(`/jobs/${jobId}`, { method: 'DELETE' })
}

/**
 * Retry a failed download
 * POST /api/jobs/:id/retry
 */
export async function retryDownload(jobId: string): Promise<DownloadResponse> {
  return apiFetch<DownloadResponse>(`/jobs/${jobId}/retry`, { method: 'POST' })
}

/**
 * Get library items
 * GET /api/library
 */
export async function getLibrary(): Promise<LibraryItem[]> {
  return apiFetch<LibraryItem[]>('/library')
}

/**
 * Get saved channels
 * GET /api/channels
 */
export async function getChannels(): Promise<SavedChannel[]> {
  return apiFetch<SavedChannel[]>('/channels')
}

/**
 * Save a channel
 * POST /api/channels
 */
export async function saveChannel(params: {
  channelId: string
  title?: string
  thumbnail?: string
  banner?: string
  monitoring?: boolean
  url?: string
}): Promise<void> {
  await apiFetch('/channels', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

/**
 * Get saved playlists
 * GET /api/playlists
 */
export async function getPlaylists(): Promise<SavedPlaylist[]> {
  return apiFetch<SavedPlaylist[]>('/playlists')
}

/**
 * Save a playlist
 * POST /api/playlists
 */
export async function savePlaylist(params: {
  playlistId: string
  title?: string
  thumbnail?: string
  uploader?: string
  itemCount?: number
  url?: string
}): Promise<void> {
  await apiFetch('/playlists', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

/**
 * Get download history
 * GET /api/history
 */
export async function getHistory(): Promise<HistoryEntry[]> {
  return apiFetch<HistoryEntry[]>('/history')
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format file size in bytes to human readable
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let size = bytes

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Format relative time
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
