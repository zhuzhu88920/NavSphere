import { cache } from 'react'
import { VideoPlayerPage } from '@/components/video-player-page'
import { Metadata } from 'next/types'
import { getProcessedData } from '@/lib/data-loader'
import { getLiveVideos, getLiveSite } from '@/lib/live-content'

export const dynamic = 'force-dynamic'

const getData = cache(async () => {
    const [videos, site] = await Promise.all([getLiveVideos(), getLiveSite()])
    return getProcessedData(videos.data, site.data)
})

export async function generateMetadata(): Promise<Metadata> {
    const { siteData } = await getData()

    return {
        title: `视频播放器 - ${siteData.basic.title}`,
        description: '视频播放中心',
        keywords: 'Bilibili, YouTube, Videos, Player',
        icons: {
            icon: siteData.appearance.favicon,
        },
    }
}

export default async function VideoPlayerRoute() {
    const { navigationData, siteData } = await getData()

    return (
        <VideoPlayerPage navigationData={navigationData} siteData={siteData} />
    )
}
