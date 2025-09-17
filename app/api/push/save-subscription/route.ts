import { NextResponse } from 'next/server'

// In-memory store for demo. Replace with DB (Supabase) in production.
const subscriptions = new Set<string>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body || !body.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }
    subscriptions.add(JSON.stringify(body))
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function GET() {
  // for testing only
  return NextResponse.json({ count: subscriptions.size })
}

export function getAllSubscriptions(): Array<PushSubscriptionJSON> {
  const list: Array<PushSubscriptionJSON> = []
  for (const s of subscriptions) {
    try { list.push(JSON.parse(s)) } catch {}
  }
  return list
}

export type PushSubscriptionJSON = {
  endpoint: string
  expirationTime: number | null
  keys: { p256dh: string; auth: string }
}


