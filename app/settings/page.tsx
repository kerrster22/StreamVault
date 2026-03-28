'use client'

import { useState } from 'react'
import {
  Settings,
  FolderOpen,
  FileText,
  Palette,
  Download,
  Subtitles,
  Cookie,
  HardDrive,
  Save,
  RotateCcw,
  Info,
  Zap,
} from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { TopBar } from '@/components/top-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const settingsSections = [
  { id: 'downloads', label: 'Downloads', icon: Download },
  { id: 'output', label: 'Output', icon: FolderOpen },
  { id: 'naming', label: 'Naming', icon: FileText },
  { id: 'subtitles', label: 'Subtitles', icon: Subtitles },
  { id: 'auth', label: 'Authentication', icon: Cookie },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'about', label: 'About', icon: Info },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('downloads')
  const [settings, setSettings] = useState({
    downloadPath: '/media/downloads',
    namingTemplate: '%(title)s.%(ext)s',
    defaultQuality: '1080p',
    extractAudio: false,
    downloadSubtitles: true,
    subtitleLanguages: ['en'],
    maxConcurrentDownloads: 3,
    theme: 'dark',
    autoUpdate: true,
    notifications: true,
  })

  const updateSetting = (key: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <main className="flex-1 pl-64">
        <TopBar />
        
        <div className="flex">
          {/* Settings Navigation */}
          <nav className="w-64 border-r border-border p-4">
            <div className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    activeSection === section.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Settings Content */}
          <div className="flex-1 p-6">
            {activeSection === 'downloads' && (
              <SettingsSection title="Download Defaults" description="Configure default download settings">
                <SettingsCard>
                  <SettingsRow
                    label="Default Quality"
                    description="Preferred quality for video downloads"
                  >
                    <Select value={settings.defaultQuality} onValueChange={(v) => updateSetting('defaultQuality', v)}>
                      <SelectTrigger className="w-40 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="4k">4K (2160p)</SelectItem>
                        <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                        <SelectItem value="720p">HD (720p)</SelectItem>
                        <SelectItem value="480p">SD (480p)</SelectItem>
                        <SelectItem value="best">Best Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsRow>

                  <SettingsRow
                    label="Concurrent Downloads"
                    description="Maximum number of simultaneous downloads"
                  >
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[settings.maxConcurrentDownloads]}
                        onValueChange={([v]) => updateSetting('maxConcurrentDownloads', v)}
                        max={5}
                        min={1}
                        step={1}
                        className="w-32"
                      />
                      <span className="w-8 text-center font-medium">{settings.maxConcurrentDownloads}</span>
                    </div>
                  </SettingsRow>

                  <SettingsRow
                    label="Extract Audio"
                    description="Automatically extract audio from video downloads"
                  >
                    <Switch
                      checked={settings.extractAudio}
                      onCheckedChange={(v) => updateSetting('extractAudio', v)}
                    />
                  </SettingsRow>

                  <SettingsRow
                    label="Auto-update Library"
                    description="Automatically check monitored channels for new videos"
                  >
                    <Switch
                      checked={settings.autoUpdate}
                      onCheckedChange={(v) => updateSetting('autoUpdate', v)}
                    />
                  </SettingsRow>
                </SettingsCard>
              </SettingsSection>
            )}

            {activeSection === 'output' && (
              <SettingsSection title="Output Paths" description="Configure where files are saved">
                <SettingsCard>
                  <SettingsRow
                    label="Download Location"
                    description="Default folder for downloaded media"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={settings.downloadPath}
                        onChange={(e) => updateSetting('downloadPath', e.target.value)}
                        className="w-64 rounded-xl"
                      />
                      <Button variant="outline" size="icon" className="rounded-xl">
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </SettingsRow>
                </SettingsCard>
              </SettingsSection>
            )}

            {activeSection === 'naming' && (
              <SettingsSection title="Naming Templates" description="Customize how files are named">
                <SettingsCard>
                  <SettingsRow
                    label="File Naming Template"
                    description="Use yt-dlp output template syntax"
                  >
                    <Input
                      value={settings.namingTemplate}
                      onChange={(e) => updateSetting('namingTemplate', e.target.value)}
                      className="w-80 font-mono text-sm rounded-xl"
                    />
                  </SettingsRow>
                  <div className="mt-4 rounded-xl bg-muted/50 p-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">Available Variables</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-mono">
                      <span>%(title)s - Video title</span>
                      <span>%(uploader)s - Channel name</span>
                      <span>%(upload_date)s - Upload date</span>
                      <span>%(id)s - Video ID</span>
                      <span>%(ext)s - File extension</span>
                      <span>%(resolution)s - Resolution</span>
                    </div>
                  </div>
                </SettingsCard>
              </SettingsSection>
            )}

            {activeSection === 'subtitles' && (
              <SettingsSection title="Subtitles" description="Configure subtitle download settings">
                <SettingsCard>
                  <SettingsRow
                    label="Download Subtitles"
                    description="Automatically download subtitles when available"
                  >
                    <Switch
                      checked={settings.downloadSubtitles}
                      onCheckedChange={(v) => updateSetting('downloadSubtitles', v)}
                    />
                  </SettingsRow>
                  <SettingsRow
                    label="Preferred Languages"
                    description="Subtitle languages to download"
                  >
                    <Select defaultValue="en">
                      <SelectTrigger className="w-40 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsRow>
                </SettingsCard>
              </SettingsSection>
            )}

            {activeSection === 'auth' && (
              <SettingsSection title="Authentication" description="Import cookies for authenticated downloads">
                <SettingsCard>
                  <SettingsRow
                    label="Cookies File"
                    description="Path to cookies.txt for authenticated access"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="No cookies file configured"
                        className="w-64 rounded-xl"
                      />
                      <Button variant="outline" size="icon" className="rounded-xl">
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </SettingsRow>
                  <div className="mt-4 rounded-xl bg-warning/10 border border-warning/20 p-4">
                    <p className="text-sm text-warning">
                      Cookie files contain sensitive authentication data. Keep them secure and never share them.
                    </p>
                  </div>
                </SettingsCard>
              </SettingsSection>
            )}

            {activeSection === 'appearance' && (
              <SettingsSection title="Appearance" description="Customize the look and feel">
                <SettingsCard>
                  <SettingsRow
                    label="Theme"
                    description="Choose your preferred color scheme"
                  >
                    <Select value={settings.theme} onValueChange={(v) => updateSetting('theme', v)}>
                      <SelectTrigger className="w-40 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsRow>
                  <SettingsRow
                    label="Notifications"
                    description="Show notifications for completed downloads"
                  >
                    <Switch
                      checked={settings.notifications}
                      onCheckedChange={(v) => updateSetting('notifications', v)}
                    />
                  </SettingsRow>
                </SettingsCard>
              </SettingsSection>
            )}

            {activeSection === 'storage' && (
              <SettingsSection title="Storage Usage" description="Monitor your storage consumption">
                <SettingsCard>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">Total Storage Used</h4>
                        <p className="text-sm text-muted-foreground">247 GB of 1 TB</p>
                      </div>
                      <span className="text-2xl font-bold text-foreground">24.7%</span>
                    </div>
                    <Progress value={24.7} className="h-3" />
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="rounded-xl bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">Videos</p>
                        <p className="text-xl font-semibold text-foreground">198 GB</p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">Audio</p>
                        <p className="text-xl font-semibold text-foreground">42 GB</p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">Other</p>
                        <p className="text-xl font-semibold text-foreground">7 GB</p>
                      </div>
                    </div>
                  </div>
                </SettingsCard>
              </SettingsSection>
            )}

            {activeSection === 'about' && (
              <SettingsSection title="About StreamVault" description="Version and system information">
                <SettingsCard>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <Zap className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">StreamVault</h3>
                        <p className="text-sm text-muted-foreground">
                          Your personal media downloader and library
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">Version</p>
                        <p className="font-medium text-foreground">1.0.0</p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">yt-dlp</p>
                        <p className="font-medium text-foreground">2026.03.25</p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">FFmpeg</p>
                        <p className="font-medium text-foreground">7.0.1</p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">Python</p>
                        <p className="font-medium text-foreground">3.12.2</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-surface border border-border p-4">
                      <p className="text-sm text-muted-foreground">
                        Backend powered by <span className="text-primary font-medium">yt-dlp</span> + <span className="text-primary font-medium">FFmpeg</span>
                      </p>
                    </div>
                  </div>
                </SettingsCard>
              </SettingsSection>
            )}

            {/* Save Button */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="outline" className="gap-2 rounded-xl">
                <RotateCcw className="h-4 w-4" />
                Reset to Defaults
              </Button>
              <Button className="gap-2 rounded-xl">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      {children}
    </div>
  )
}

function SettingsRow({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium text-foreground">{label}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}
