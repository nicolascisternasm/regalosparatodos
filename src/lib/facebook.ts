// Facebook / Instagram Graph API client
// Requires env vars:
//   FB_PAGE_ACCESS_TOKEN  — Page Access Token with permissions:
//     pages_read_engagement, pages_messaging,
//     instagram_basic, instagram_manage_comments, instagram_manage_messages
//   FB_PAGE_ID            — Facebook page ID (e.g. 1475831625611176)
//   FB_IG_ACCOUNT_ID      — Instagram Business Account ID linked to the page

const BASE = 'https://graph.facebook.com/v19.0'

function token() {
  const t = process.env.FB_PAGE_ACCESS_TOKEN
  if (!t) throw new Error('FB_PAGE_ACCESS_TOKEN not set')
  return t
}

async function gql<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('access_token', token())
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  const json = await res.json()
  if (json.error) throw new Error(`Meta API: ${json.error.message} (code ${json.error.code})`)
  return json as T
}

async function post<T>(path: string, body: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('access_token', token())
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (json.error) throw new Error(`Meta API: ${json.error.message} (code ${json.error.code})`)
  return json as T
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FBComment {
  id: string
  message: string
  from?: { id: string; name: string }
  created_time: string
  can_reply_privately?: boolean
  post_id?: string
  source: 'facebook' | 'instagram'
}

export interface FBMessage {
  id: string
  message: string
  from?: { id: string; name: string; email?: string }
  created_time: string
  thread_id: string
  source: 'facebook' | 'instagram'
}

export interface FBThread {
  id: string
  participants: { data: Array<{ id: string; name: string; email?: string }> }
  messages: { data: FBMessage[] }
  updated_time: string
  source: 'facebook' | 'instagram'
}

// ─── Facebook Comments ────────────────────────────────────────────────────────

export async function getFacebookComments(limit = 25): Promise<FBComment[]> {
  const pageId = process.env.FB_PAGE_ID
  if (!pageId) throw new Error('FB_PAGE_ID not set')

  const data = await gql<{ data: Array<{ id: string; message: string; from?: { id: string; name: string }; created_time: string; can_reply_privately: boolean }> }>(
    `/${pageId}/feed`,
    { fields: 'id,message,from,created_time,comments{id,message,from,created_time,can_reply_privately}', limit: '10' }
  )

  const comments: FBComment[] = []
  for (const post of data.data ?? []) {
    const postComments = (post as any).comments?.data ?? []
    for (const c of postComments) {
      comments.push({ ...c, post_id: post.id, source: 'facebook' })
    }
  }
  return comments.slice(0, limit)
}

// ─── Facebook Messages (Inbox) ────────────────────────────────────────────────

export async function getFacebookThreads(limit = 20): Promise<FBThread[]> {
  const pageId = process.env.FB_PAGE_ID
  if (!pageId) throw new Error('FB_PAGE_ID not set')

  const data = await gql<{ data: FBThread[] }>(
    `/${pageId}/conversations`,
    {
      fields: 'id,participants,messages{id,message,from,created_time},updated_time',
      limit: String(limit),
    }
  )
  return (data.data ?? []).map(t => ({ ...t, source: 'facebook' as const }))
}

// ─── Instagram Comments ───────────────────────────────────────────────────────

export async function getInstagramComments(limit = 25): Promise<FBComment[]> {
  const igId = process.env.FB_IG_ACCOUNT_ID
  if (!igId) throw new Error('FB_IG_ACCOUNT_ID not set')

  const media = await gql<{ data: Array<{ id: string }> }>(
    `/${igId}/media`,
    { fields: 'id', limit: '10' }
  )

  const comments: FBComment[] = []
  for (const m of media.data ?? []) {
    const c = await gql<{ data: Array<{ id: string; text: string; username: string; timestamp: string }> }>(
      `/${m.id}/comments`,
      { fields: 'id,text,username,timestamp', limit: '10' }
    )
    for (const item of c.data ?? []) {
      comments.push({
        id: item.id,
        message: item.text,
        from: { id: item.username, name: item.username },
        created_time: item.timestamp,
        post_id: m.id,
        source: 'instagram',
      })
    }
  }
  return comments.slice(0, limit)
}

// ─── Instagram DMs ────────────────────────────────────────────────────────────

export async function getInstagramThreads(limit = 20): Promise<FBThread[]> {
  const igId = process.env.FB_IG_ACCOUNT_ID
  if (!igId) throw new Error('FB_IG_ACCOUNT_ID not set')

  const data = await gql<{ data: FBThread[] }>(
    `/${igId}/conversations`,
    {
      fields: 'id,participants,messages{id,message,from,created_time},updated_time',
      limit: String(limit),
    }
  )
  return (data.data ?? []).map(t => ({ ...t, source: 'instagram' as const }))
}

// ─── Reply to comment ─────────────────────────────────────────────────────────

export async function replyToComment(commentId: string, message: string): Promise<{ id: string }> {
  return post(`/${commentId}/replies`, { message })
}

// ─── Reply to message thread ──────────────────────────────────────────────────

export async function replyToThread(
  pageOrIgId: string,
  recipientId: string,
  message: string
): Promise<{ recipient_id: string; message_id: string }> {
  return post(`/${pageOrIgId}/messages`, {
    recipient: JSON.stringify({ id: recipientId }),
    message: JSON.stringify({ text: message }),
  })
}
