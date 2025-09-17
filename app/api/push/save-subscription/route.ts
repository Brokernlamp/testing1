import { NextResponse } from 'next/server'
import { addSubscription, getCount } from '@/lib/pushStore'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body || !body.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }
    addSubscription(body)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function GET() {
  // for testing only
  return NextResponse.json({ count: getCount() })
}

