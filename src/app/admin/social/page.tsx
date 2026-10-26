'use client'

import { useState, useEffect, useCallback } from 'react'

type Source = 'facebook' | 'instagram'

interface Comment {
  id: string
  message: string
  from?: { id: string; name: string }
  created_time: string
  post_id?: string
  source: Source
}

interface Message {
  id: string
  message: string
  from?: { id: string; name: string }
  created_time: string
}

interface Thread {
  id: string
  participants: { data: Array<{ id: string; name: string }> }
  messages: { data: Message[] }
  updated_time: string
  source: Source
}

type Tab = 'comments' | 'messages'

const SOURCE_COLORS: Record<Source, string> = {
  facebook: 'bg-blue-100 text-blue-800',
  instagram: 'bg-pink-100 text-pink-800',
}

export default function SocialAssistantPage() {
  const [tab, setTab] = useState<Tab>('comments')
  const [sourceFilter, setSourceFilter] = useState<'all' | Source>('all')
  const [comments, setComments] = useState<Comment[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const [replyTarget, setReplyTarget] = useState<{ type: 'comment' | 'message'; id: string; name: string; source: Source } | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [sentOk, setSentOk] = useState(false)

  const loadComments = useCallback(async () => {
    setLoading(true)
    setErrors([])
    try {
      const res = await fetch(`/api/social/comments?source=${sourceFilter}`)
      const data = await res.json()
      setComments(data.comments ?? [])
      if (data.errors) setErrors(data.errors)
    } catch (e: any) {
      setErrors([e.message])
    } finally {
      setLoading(false)
    }
  }, [sourceFilter])

  const loadMessages = useCallback(async () => {
    setLoading(true)
    setErrors([])
    try {
      const res = await fetch(`/api/social/messages?source=${sourceFilter}`)
      const data = await res.json()
      setThreads(data.threads ?? [])
      if (data.errors) setErrors(data.errors)
    } catch (e: any) {
      setErrors([e.message])
    } finally {
      setLoading(false)
    }
  }, [sourceFilter])

  useEffect(() => {
    if (tab === 'comments') loadComments()
    else loadMessages()
  }, [tab, sourceFilter, loadComments, loadMessages])

  const handleReply = async () => {
    if (!replyTarget || !replyText.trim()) return
    setSending(true)
    try {
      const body =
        replyTarget.type === 'comment'
          ? { type: 'comment', commentId: replyTarget.id, message: replyText }
          : { type: 'message', recipientId: replyTarget.id, message: replyText, source: replyTarget.source }

      const res = await fetch('/api/social/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.ok) {
        setSentOk(true)
        setReplyText('')
        setTimeout(() => {
          setSentOk(false)
          setReplyTarget(null)
        }, 2000)
      } else {
        setErrors([data.error ?? 'Error al enviar'])
      }
    } catch (e: any) {
      setErrors([e.message])
    } finally {
      setSending(false)
    }
  }

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Asistente de Ventas Social</h1>
        <p className="text-gray-500 text-sm mb-6">Regalos para Todos — Facebook & Instagram</p>

        {/* Tabs + Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['comments', 'messages'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t === 'comments' ? 'Comentarios' : 'Mensajes'}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['all', 'facebook', 'instagram'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  sourceFilter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s === 'all' ? 'Todos' : s === 'facebook' ? 'Facebook' : 'Instagram'}
              </button>
            ))}
          </div>
          <button
            onClick={() => (tab === 'comments' ? loadComments() : loadMessages())}
            disabled={loading}
            className="ml-auto px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Cargando…' : '↻ Actualizar'}
          </button>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            {errors.map((e, i) => (
              <p key={i} className="text-red-700 text-sm">{e}</p>
            ))}
          </div>
        )}

        {/* Comments */}
        {tab === 'comments' && (
          <div className="space-y-3">
            {comments.length === 0 && !loading && (
              <p className="text-gray-400 text-sm text-center py-12">No hay comentarios recientes</p>
            )}
            {comments.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_COLORS[c.source]}`}>
                        {c.source}
                      </span>
                      <span className="text-sm font-medium text-gray-800 truncate">{c.from?.name ?? 'Desconocido'}</span>
                      <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">{fmt(c.created_time)}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{c.message}</p>
                  </div>
                  <button
                    onClick={() => setReplyTarget({ type: 'comment', id: c.id, name: c.from?.name ?? 'Usuario', source: c.source })}
                    className="shrink-0 text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700"
                  >
                    Responder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        {tab === 'messages' && (
          <div className="space-y-3">
            {threads.length === 0 && !loading && (
              <p className="text-gray-400 text-sm text-center py-12">No hay mensajes recientes</p>
            )}
            {threads.map(thread => {
              const other = thread.participants.data.find(p => p.id !== process.env.NEXT_PUBLIC_FB_PAGE_ID) ?? thread.participants.data[0]
              const lastMsg = thread.messages.data[thread.messages.data.length - 1]
              return (
                <div key={thread.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_COLORS[thread.source]}`}>
                          {thread.source}
                        </span>
                        <span className="text-sm font-medium text-gray-800 truncate">{other?.name ?? 'Desconocido'}</span>
                        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">{fmt(thread.updated_time)}</span>
                      </div>
                      {lastMsg && <p className="text-gray-700 text-sm truncate">{lastMsg.message}</p>}
                      <p className="text-gray-400 text-xs mt-1">{thread.messages.data.length} mensaje(s)</p>
                    </div>
                    <button
                      onClick={() => setReplyTarget({ type: 'message', id: other?.id ?? thread.id, name: other?.name ?? 'Usuario', source: thread.source })}
                      className="shrink-0 text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_COLORS[replyTarget.source]}`}>
                {replyTarget.source}
              </span>
              <h3 className="font-semibold text-gray-900">
                Responder a {replyTarget.name}
              </h3>
            </div>
            {sentOk ? (
              <p className="text-green-600 font-medium text-center py-4">✓ Enviado</p>
            ) : (
              <>
                <textarea
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                  rows={4}
                  placeholder="Escribe tu respuesta…"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => { setReplyTarget(null); setReplyText('') }}
                    className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={sending || !replyText.trim()}
                    className="flex-1 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
                  >
                    {sending ? 'Enviando…' : 'Enviar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
