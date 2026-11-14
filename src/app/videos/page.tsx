import { cache } from 'react'
import { VideoContent } from '@/components/video-content'
import { Metadata } from 'next/types'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Container } from '@/components/ui/container'
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
        title: `Videos - ${siteData.basic.title}`,
        description: 'Video Navigation',
        keywords: 'Bilibili, YouTube, Videos',
        icons: {
            icon: siteData.appearance.favicon,
        },
    }
}

export default async function VideosPage() {
    const { navigationData, siteData } = await getData()

    return (
        <Container>
            <VideoContent navigationData={navigationData} siteData={siteData} />
            <ScrollToTop />
        </Container>
    )
}
