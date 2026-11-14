import { NextResponse } from 'next/server'
import { getLiveNavigation } from '@/lib/live-content'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, source } = await getLiveNavigation()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        'Content-Type': 'application/json',
        'X-Data-Source': source
      }
    })
  } catch (error) {
    console.error('Error in navigation API:', error)
    return NextResponse.json(
      { error: '获取导航数据失败' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
