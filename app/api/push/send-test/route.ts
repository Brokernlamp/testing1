import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { getAllSubscriptions } from '@/lib/pushStore'

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY as string
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY as string
const VAPID_CONTACT = process.env.VAPID_CONTACT || 'mailto:admin@example.com'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

export async function POST() {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'Missing VAPID keys' }, { status: 500 })
  }
  const payload = JSON.stringify({
    title: 'Hello from SKS',
    body: 'This is a test push notification',
    url: '/',
  })
  const subs = getAllSubscriptions()
  const results: Array<{ endpoint: string; ok: boolean }> = []
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub as unknown as webpush.PushSubscription, payload)
        results.push({ endpoint: sub.endpoint, ok: true })
      } catch (e) {
        results.push({ endpoint: sub.endpoint, ok: false })
      }
    })
  )
  return NextResponse.json({ sent: results.length, results })
}


