import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export const runtime = 'nodejs'

type CartPayload = {
  company_name: string
  email: string | null
  department?: string
  contact?: string
  delivery?: string
  comments?: string
  items: Array<{
    id: string
    type: 'product' | 'custom'
    name: string
    size: string | null
    quantity: number
    material: string | null
    comments?: string | null
    images?: string[]
  }>
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CartPayload
    if (!body || !body.company_name || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const admin = createServiceRoleClient()

    // 1) Find or create customer by company name; keep email up to date
    let customerId: string | null = null
    {
      const { data: existing } = await admin
        .from('customers')
        .select('id')
        .eq('company_name', body.company_name.trim())
        .single()
      if (existing) {
        customerId = existing.id
      } else {
        const { data: created, error: createErr } = await admin
          .from('customers')
          .insert({ company_name: body.company_name.trim(), source: 'web' })
          .select('id')
          .single()
        if (createErr) throw createErr
        customerId = created.id
      }
    }

    if (!customerId) throw new Error('Failed to resolve customer')

    // 2) Process items - create enquiries for products, custom_orders for custom items
    const enquiryInserts: any[] = []
    const customOrderInserts: any[] = []

    for (const item of body.items) {
      if (item.type === 'product') {
        // Regular product - create enquiry
        const productId = item.id.split(':')[0] // item.id format is "<productId>:timestamp"
        enquiryInserts.push({
          customer_id: customerId,
          product_id: productId,
          size: item.size || null,
          quantity: item.quantity || 1,
          material: item.material || null,
          delivery_date: body.delivery || null,
          comments: [body.comments || '', item.comments || ''].filter(Boolean).join(' | ') || null,
          images: item.images || [],
          status: 'pending',
        })
      } else {
        // Custom order - create custom_order record
        customOrderInserts.push({
          customer_id: customerId,
          name: item.name.trim(),
          size: item.size || null,
          material: item.material || null,
          quantity: item.quantity || 1,
          images: item.images || [],
          delivery_date: body.delivery || null,
          comments: [body.comments || '', item.comments || ''].filter(Boolean).join(' | ') || null,
          status: 'pending',
        })
      }
    }

    // 3) Insert enquiries for regular products
    if (enquiryInserts.length > 0) {
      const { error: insErr } = await admin.from('enquiries').insert(enquiryInserts)
      if (insErr) throw insErr
    }

    // 4) Insert custom orders with sequential order_id CUST-0001
    if (customOrderInserts.length > 0) {
      // Find current max sequence
      let startSeq = 0
      try {
        const { data: rows } = await admin
          .from('custom_orders')
          .select('order_id')
          .not('order_id', 'is', null)
        ;(rows || []).forEach((r: any) => {
          const m = String(r.order_id || '').match(/CUST-(\d{1,})$/)
          if (m) {
            const n = parseInt(m[1], 10)
            if (!isNaN(n)) startSeq = Math.max(startSeq, n)
          }
        })
      } catch {}

      const insertsWithIds = customOrderInserts.map((co, idx) => ({
        ...co,
        order_id: `CUST-${String(startSeq + idx + 1).padStart(4, '0')}`
      }))

      const { error: custErr } = await admin.from('custom_orders').insert(insertsWithIds)
      if (custErr) throw custErr
    }

    return NextResponse.json({ 
      ok: true, 
      regularOrders: enquiryInserts.length,
      customOrders: customOrderInserts.length
    })
  } catch (e: any) {
    console.error('cart-enquiries error', e)
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 })
  }
}


