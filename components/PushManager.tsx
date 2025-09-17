"use client"

import { useEffect, useState } from 'react'

declare global {
  interface Window { workbox?: any }
}

export default function PushManagerClient() {
  const [permission, setPermission] = useState<NotificationPermission>(typeof Notification !== 'undefined' ? Notification.permission : 'default')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    setPermission(typeof Notification !== 'undefined' ? Notification.permission : 'default')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    navigator.serviceWorker.ready.then(async (reg) => {
      const existing = await reg.pushManager.getSubscription()
      setSubscribed(!!existing)
    })
  }, [])

  const askPermission = async () => {
    if (!('Notification' in window)) return
    const p = await Notification.requestPermission()
    setPermission(p)
    if (p === 'granted') await subscribe()
  }

  const subscribe = async () => {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) {
      console.warn('Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY')
      return
    }
    const reg = await navigator.serviceWorker.register('/sw.js')
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
    await fetch('/api/push/save-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    })
    setSubscribed(true)
  }

  const sendTest = async () => {
    await fetch('/api/push/send-test', { method: 'POST' })
  }

  if (!('Notification' in globalThis)) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {permission !== 'granted' ? (
        <button onClick={askPermission} className="px-4 py-2 rounded-lg bg-primary-600 text-white shadow">
          Enable Notifications
        </button>
      ) : !subscribed ? (
        <button onClick={subscribe} className="px-4 py-2 rounded-lg bg-gray-900 text-white shadow">
          Subscribe to Push
        </button>
      ) : (
        <button onClick={sendTest} className="px-4 py-2 rounded-lg bg-green-600 text-white shadow">
          Send Test
        </button>
      )}
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}


