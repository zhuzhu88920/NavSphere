import { NextResponse } from 'next/server'
import { getLiveSite } from '@/lib/live-content'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, source } = await getLiveSite()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        'X-Data-Source': source
      }
    })
  } catch (error) {
    console.error('Error in site API:', error)
    return NextResponse.json(
      { error: '获取站点数据失败' },
      { status: 500 }
    )
  }
}
