import type { NavigationDataRaw } from '@/types/navigation'
import type { SiteInfo } from '@/types/site'
import navigationSnapshot from '@/navsphere/content/navigation.json'
import videosSnapshot from '@/navsphere/content/videos.json'
import siteSnapshot from '@/navsphere/content/site.json'

export type LiveSource = 'github' | 'snapshot'

export type LiveResult<T> = {
  data: T
  source: LiveSource
}

type CfRequestInit = RequestInit & {
  cf?: { cacheTtl?: number; cacheEverything?: boolean }
}

const TTL_SECONDS = 30

function remoteUrl(file: string, bucket: number): string | null {
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'
  if (!owner || !repo) return null
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/src/navsphere/content/${file}?v=${bucket}`
}

async function loadRemote<T>(
  file: string,
  fallback: T,
  validate: (value: unknown) => boolean
): Promise<LiveResult<T>> {
  const bucket = Math.floor(Date.now() / (TTL_SECONDS * 1000))
  const url = remoteUrl(file, bucket)
  if (!url) return { data: fallback, source: 'snapshot' }

  try {
    const init: CfRequestInit = {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
      headers: {
        Accept: 'application/json',
        'User-Agent': 'NavSphere-Worker',
      },
      cf: { cacheTtl: TTL_SECONDS, cacheEverything: true },
    }
    const response = await fetch(url, init)
    if (!response.ok) throw new Error(`GitHub raw responded ${response.status}`)
    const data = (await response.json()) as T
    if (!validate(data)) throw new Error('Unexpected content shape')
    return { data, source: 'github' }
  } catch (error) {
    console.error(`[live-content] using bundled snapshot for ${file}`, error)
    return { data: fallback, source: 'snapshot' }
  }
}

const isNavigation = (value: unknown): boolean =>
  !!value &&
  typeof value === 'object' &&
  Array.isArray((value as { navigationItems?: unknown }).navigationItems)

const isSite = (value: unknown): boolean =>
  !!value &&
  typeof value === 'object' &&
  !!(value as { basic?: unknown }).basic

export async function getLiveNavigation(): Promise<LiveResult<NavigationDataRaw>> {
  return loadRemote(
    'navigation.json',
    navigationSnapshot as unknown as NavigationDataRaw,
    isNavigation
  )
}

export async function getLiveVideos(): Promise<LiveResult<NavigationDataRaw>> {
  return loadRemote(
    'videos.json',
    videosSnapshot as unknown as NavigationDataRaw,
    isNavigation
  )
}

export async function getLiveSite(): Promise<LiveResult<SiteInfo>> {
  return loadRemote(
    'site.json',
    siteSnapshot as unknown as SiteInfo,
    isSite
  )
}
