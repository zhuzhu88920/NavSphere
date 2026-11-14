import { cache } from 'react'
import { NavigationContent } from '@/components/navigation-content'
import { Metadata } from 'next/types'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Container } from '@/components/ui/container'
import { getProcessedData } from '@/lib/data-loader'
import { getLiveNavigation, getLiveSite } from '@/lib/live-content'

export const dynamic = 'force-dynamic'

const getData = cache(async () => {
  const [navigation, site] = await Promise.all([getLiveNavigation(), getLiveSite()])
  return getProcessedData(navigation.data, site.data)
})

export async function generateMetadata(): Promise<Metadata> {
  const { siteData } = await getData()

  return {
    title: siteData.basic.title,
    description: siteData.basic.description,
    keywords: siteData.basic.keywords,
    icons: {
      icon: siteData.appearance.favicon,
    },
  }
}

export default async function HomePage() {
  const { navigationData, siteData } = await getData()

  return (
    <Container>
      <NavigationContent navigationData={navigationData} siteData={siteData} />
      <ScrollToTop />
    </Container>
  )
}
