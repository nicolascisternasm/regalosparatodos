import { NextResponse } from 'next/server'
import { getFacebookComments, getInstagramComments } from '@/lib/facebook'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source') ?? 'all' // 'facebook' | 'instagram' | 'all'

  try {
    const results = await Promise.allSettled([
      source !== 'instagram' ? getFacebookComments(30) : Promise.resolve([]),
      source !== 'facebook' ? getInstagramComments(30) : Promise.resolve([]),
    ])

    const fbComments = results[0].status === 'fulfilled' ? results[0].value : []
    const igComments = results[1].status === 'fulfilled' ? results[1].value : []

    const errors: string[] = []
    if (results[0].status === 'rejected') errors.push(`Facebook: ${(results[0] as PromiseRejectedResult).reason?.message}`)
    if (results[1].status === 'rejected') errors.push(`Instagram: ${(results[1] as PromiseRejectedResult).reason?.message}`)

    const all = [...fbComments, ...igComments].sort(
      (a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime()
    )

    return NextResponse.json({ comments: all, errors: errors.length ? errors : undefined })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
