import { NextResponse } from 'next/server'
import { replyToComment, replyToThread } from '@/lib/facebook'

// POST /api/social/reply
// Body: { type: 'comment', commentId: string, message: string }
//    or { type: 'message', recipientId: string, message: string, source: 'facebook'|'instagram' }
export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, message } = body
  if (!type || !message) {
    return NextResponse.json({ error: 'type and message are required' }, { status: 400 })
  }

  try {
    if (type === 'comment') {
      const { commentId } = body
      if (!commentId) return NextResponse.json({ error: 'commentId required' }, { status: 400 })
      const result = await replyToComment(commentId, message)
      return NextResponse.json({ ok: true, result })
    }

    if (type === 'message') {
      const { recipientId, source } = body
      if (!recipientId) return NextResponse.json({ error: 'recipientId required' }, { status: 400 })
      const pageOrIgId = source === 'instagram'
        ? process.env.FB_IG_ACCOUNT_ID!
        : process.env.FB_PAGE_ID!
      if (!pageOrIgId) return NextResponse.json({ error: `${source === 'instagram' ? 'FB_IG_ACCOUNT_ID' : 'FB_PAGE_ID'} not set` }, { status: 500 })
      const result = await replyToThread(pageOrIgId, recipientId, message)
      return NextResponse.json({ ok: true, result })
    }

    return NextResponse.json({ error: 'type must be "comment" or "message"' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
