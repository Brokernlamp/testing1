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
        // Update email/phone if provided
        await admin.from('customers').update({ email: body.email || null, phone: body.contact || null }).eq('id', existing.id)
      } else {
        const { data: created, error: createErr } = await admin
          .from('customers')
          .insert({ company_name: body.company_name.trim(), email: body.email || null, phone: body.contact || null, source: 'web' })
          .select('id')
          .single()
        if (createErr) throw createErr
        customerId = created.id
      }
    }

    if (!customerId) throw new Error('Failed to resolve customer')

    // 2) Ensure a "Custom Orders" category exists for custom items
    const ensureCustomProduct = async (name: string) => {
      const categoryName = 'Custom Orders'
      let categoryId: string
      {
        const { data: cat } = await admin
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .single()
        if (cat) categoryId = cat.id
        else {
          const { data: newCat, error: catErr } = await admin
            .from('categories')
            .insert({ name: categoryName })
            .select('id')
            .single()
          if (catErr) throw catErr
          categoryId = newCat.id
        }
      }

      // find or create product by name within Custom Orders
      const { data: prod } = await admin
        .from('products')
        .select('id')
        .eq('name', name)
        .single()
      if (prod) return prod.id
      const { data: newProd, error: prodErr } = await admin
        .from('products')
        .insert({ name, category_id: categoryId, is_active: true })
        .select('id')
        .single()
      if (prodErr) throw prodErr
      return newProd.id
    }

    // 3) Insert enquiries for each item
    const inserts: any[] = []
    for (const item of body.items) {
      let productId: string
      if (item.type === 'product') {
        // item.id format is "<productId>:timestamp"; recover productId
        productId = item.id.split(':')[0]
      } else {
        productId = await ensureCustomProduct(item.name.trim())
      }

      inserts.push({
        customer_id: customerId,
        product_id: productId,
        size: item.size || null,
        quantity: item.quantity || 1,
        material: item.material || null,
        delivery_date: body.delivery || null,
        comments: [body.comments || '', item.comments || ''].filter(Boolean).join(' | ') || null,
        status: 'pending',
      })
    }

    if (inserts.length > 0) {
      const { error: insErr } = await admin.from('enquiries').insert(inserts)
      if (insErr) throw insErr
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('cart-enquiries error', e)
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 })
  }
}


