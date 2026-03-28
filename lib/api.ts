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

import {
  mockVideoSource,
  mockPlaylistSource,
  mockChannelSource,
  mockActiveDownloads,
  mockQueuedDownloads,
  mockCompletedDownloads,
  mockFailedDownloads,
  mockLibraryItems,
  mockSavedChannels,
  mockSavedPlaylists,
  mockHistory,
} from './mock-data'

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// API Base URL - will be configured for real backend later
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

/**
 * Analyze a URL and return metadata
 * POST /api/analyze
 */
export async function analyzeUrl(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  await delay(800) // Simulate network delay
  
  // Mock detection based on URL patterns
  const url = request.url.toLowerCase()
  
  if (url.includes('playlist')) {
    return mockPlaylistSource
  } else if (url.includes('channel') || url.includes('@')) {
    return mockChannelSource
  } else {
    return mockVideoSource
  }
  
  // Real implementation:
  // const response = await fetch(`${API_BASE}/analyze`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // })
  // return response.json()
}

/**
 * Start a download job
 * POST /api/download
 */
export async function startDownload(request: DownloadRequest): Promise<DownloadResponse> {
  await delay(300)
  
  return {
    jobId: `job_${Date.now()}`,
    status: 'queued',
  }
  
  // Real implementation:
  // const response = await fetch(`${API_BASE}/download`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // })
  // return response.json()
}

/**
 * Get job status
 * GET /api/jobs/:id
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  await delay(200)
  
  const allJobs = [...mockActiveDownloads, ...mockQueuedDownloads, ...mockCompletedDownloads, ...mockFailedDownloads]
  const job = allJobs.find(j => j.jobId === jobId)
  
  if (!job) {
    throw new Error('Job not found')
  }
  
  return {
    jobId: job.jobId,
    status: job.status,
    progress: job.progress,
    speed: job.speed,
    eta: job.eta,
  }
  
  // Real implementation:
  // const response = await fetch(`${API_BASE}/jobs/${jobId}`)
  // return response.json()
}

/**
 * Get all download jobs
 * GET /api/jobs
 */
export async function getDownloads(): Promise<{
  active: DownloadJob[]
  queued: DownloadJob[]
  completed: DownloadJob[]
  failed: DownloadJob[]
}> {
  await delay(300)
  
  return {
    active: mockActiveDownloads,
    queued: mockQueuedDownloads,
    completed: mockCompletedDownloads,
    failed: mockFailedDownloads,
  }
  
  // Real implementation:
  // const response = await fetch(`${API_BASE}/jobs`)
  // return response.json()
}

/**
 * Cancel a download job
 * DELETE /api/jobs/:id
 */
export async function cancelDownload(jobId: string): Promise<void> {
  await delay(200)
  console.log('Cancelled job:', jobId)
  
  // Real implementation:
  // await fetch(`${API_BASE}/jobs/${jobId}`, { method: 'DELETE' })
}

/**
 * Retry a failed download
 * POST /api/jobs/:id/retry
 */
export async function retryDownload(jobId: string): Promise<DownloadResponse> {
  await delay(300)
  
  return {
    jobId: `job_${Date.now()}`,
    status: 'queued',
  }
  
  // Real implementation:
  // const response = await fetch(`${API_BASE}/jobs/${jobId}/retry`, { method: 'POST' })
  // return response.json()
}

/**
 * Get library items
 * GET /api/library
 */
export async function getLibrary(): Promise<LibraryItem[]> {
  await delay(300)
  return mockLibraryItems
  
  // Real implementation:
  // const response = await fetch(`${API_BASE}/library`)
  // return response.json()
}

/**
 * Get saved channels
 * GET /api/channels
 */
export async function getChannels(): Promise<SavedChannel[]> {
  await delay(300)
  return mockSavedChannels
  
  // Real implementation:
  // const response = await fetch(`${API_BASE}/channels`)
  // return response.json()
}

/**
 * Save a channel
 * POST /api/channels
 */
export async function saveChannel(channelId: string, monitoring: boolean): Promise<void> {
  await delay(300)
  console.log('Saved channel:', channelId, 'monitoring:', monitoring)
  
  // Real implementation:
  // await fetch(`${API_BASE}/channels`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ channelId, monitoring }),
  // })
}

/**
 * Get saved playlists
 * GET /api/playlists
 */
export async function getPlaylists(): Promise<SavedPlaylist[]> {
  await delay(300)
  return mockSavedPlaylists
  
  // Real implementation:
  // const response = await fetch(`${API_BASE}/playlists`)
  // return response.json()
}

/**
 * Save a playlist
 * POST /api/playlists
 */
export async function savePlaylist(playlistId: string): Promise<void> {
  await delay(300)
  console.log('Saved playlist:', playlistId)
  
  // Real implementation:
  // await fetch(`${API_BASE}/playlists`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ playlistId }),
  // })
}

/**
 * Get download history
 * GET /api/history
 */
export async function getHistory(): Promise<HistoryEntry[]> {
  await delay(300)
  return mockHistory
  
  // Real implementation:
  // const response = await fetch(`${API_BASE}/history`)
  // return response.json()
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
