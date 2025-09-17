export type PushSubscriptionJSON = {
  endpoint: string
  expirationTime: number | null
  keys: { p256dh: string; auth: string }
}

const subscriptions = new Set<string>()

export function addSubscription(sub: PushSubscriptionJSON) {
  subscriptions.add(JSON.stringify(sub))
}

export function getAllSubscriptions(): Array<PushSubscriptionJSON> {
  const list: Array<PushSubscriptionJSON> = []
  for (const s of subscriptions) {
    try { list.push(JSON.parse(s)) } catch {}
  }
  return list
}

export function getCount() {
  return subscriptions.size
}


