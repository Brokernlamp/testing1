import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export const runtime = 'nodejs'

type Payload = {
  productIds?: string[]
  customIds?: string[]
  status: string
  invoiceNumber?: string | null
}

export async function POST(req: Request) {
  try {
    const { productIds = [], customIds = [], status, invoiceNumber = null } = (await req.json()) as Payload
    if ((!productIds?.length && !customIds?.length) || !status) {
      return NextResponse.json({ error: 'Missing ids or status' }, { status: 400 })
    }

    const admin = createServiceRoleClient()
    const now = new Date().toISOString()

    if (productIds.length) {
      const update: any = { status, updated_at: now }
      if (status === 'completed' && invoiceNumber) {
        update.invoice_number = invoiceNumber
      }
      const { error } = await admin.from('enquiries').update(update).in('id', productIds)
      if (error) throw error
      // optional activity log per id
      await admin.from('enquiry_activity').insert(productIds.map((id)=> ({ enquiry_id: id, action: 'status_change', note: status })))
    }

    if (customIds.length) {
      const { error } = await admin.from('custom_orders').update({ status, updated_at: now }).in('id', customIds)
      if (error) throw error
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('admin-update-status error', e)
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 })
  }
}


