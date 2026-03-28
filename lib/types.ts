// API Types for StreamVault

export type SourceType = 'video' | 'playlist' | 'channel'
export type DownloadStatus = 'queued' | 'downloading' | 'completed' | 'failed' | 'paused'
export type DownloadMode = 'video' | 'audio' | 'both'

export interface VideoFormat {
  format_id: string
  label: string
  ext: string
  resolution: string
  filesize: number
  audio: boolean
  video: boolean
}

export interface VideoEntry {
  id: string
  title: string
  thumbnail: string
  duration: number
  publishDate?: string
}

export interface VideoSource {
  type: 'video'
  id: string
  title: string
  thumbnail: string
  uploader: string
  duration: number
  publishDate: string
  description?: string
  formats: VideoFormat[]
}

export interface PlaylistSource {
  type: 'playlist'
  id: string
  title: string
  thumbnail: string
  uploader: string
  entryCount: number
  entries: VideoEntry[]
}

export interface ChannelSource {
  type: 'channel'
  id: string
  title: string
  thumbnail: string
  banner: string
  uploader: string
  subscriberCount?: string
  entryCount: number
  entries: VideoEntry[]
  playlists?: PlaylistSource[]
}

export type AnalyzeResponse = VideoSource | PlaylistSource | ChannelSource

export interface DownloadRequest {
  url: string
  sourceType: SourceType
  formatId: string
  mode: DownloadMode
  selectedEntries?: string[]
}

export interface DownloadJob {
  jobId: string
  url: string
  title: string
  thumbnail: string
  sourceType: SourceType
  status: DownloadStatus
  progress: number
  speed?: string
  eta?: number
  format?: string
  quality?: string
  filesize?: number
  error?: string
  createdAt: string
  completedAt?: string
}

export interface LibraryItem {
  id: string
  title: string
  thumbnail: string
  uploader: string
  duration: number
  filesize: number
  format: string
  quality: string
  downloadedAt: string
  filePath: string
  sourceType: SourceType
  channelId?: string
  playlistId?: string
}

export interface SavedChannel {
  id: string
  title: string
  thumbnail: string
  banner: string
  videoCount: number
  lastChecked: string
  monitoring: boolean
}

export interface SavedPlaylist {
  id: string
  title: string
  thumbnail: string
  uploader: string
  itemCount: number
  lastSynced: string
  downloadedCount: number
}

export interface HistoryEntry {
  id: string
  url: string
  title: string
  thumbnail: string
  sourceType: SourceType
  status: DownloadStatus
  timestamp: string
}

export interface Settings {
  downloadPath: string
  namingTemplate: string
  defaultQuality: string
  extractAudio: boolean
  downloadSubtitles: boolean
  subtitleLanguages: string[]
  cookiesPath?: string
  maxConcurrentDownloads: number
  theme: 'dark' | 'light' | 'system'
}

// API function types
export interface AnalyzeRequest {
  url: string
}

export interface DownloadResponse {
  jobId: string
  status: DownloadStatus
}

export interface JobStatusResponse {
  jobId: string
  status: DownloadStatus
  progress: number
  speed?: string
  eta?: number
}
