import { NextResponse } from 'next/server'
import { getFacebookThreads, getInstagramThreads } from '@/lib/facebook'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source') ?? 'all'

  try {
    const results = await Promise.allSettled([
      source !== 'instagram' ? getFacebookThreads(20) : Promise.resolve([]),
      source !== 'facebook' ? getInstagramThreads(20) : Promise.resolve([]),
    ])

    const fbThreads = results[0].status === 'fulfilled' ? results[0].value : []
    const igThreads = results[1].status === 'fulfilled' ? results[1].value : []

    const errors: string[] = []
    if (results[0].status === 'rejected') errors.push(`Facebook: ${(results[0] as PromiseRejectedResult).reason?.message}`)
    if (results[1].status === 'rejected') errors.push(`Instagram: ${(results[1] as PromiseRejectedResult).reason?.message}`)

    const all = [...fbThreads, ...igThreads].sort(
      (a, b) => new Date(b.updated_time).getTime() - new Date(a.updated_time).getTime()
    )

    return NextResponse.json({ threads: all, errors: errors.length ? errors : undefined })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
