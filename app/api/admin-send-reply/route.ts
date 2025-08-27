import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createServiceRoleClient } from '@/lib/supabase'

export const runtime = 'nodejs'

type Payload = {
  enquiryIds: string[]
  templateId: string
  status: string
  extraImages?: string[]
  extraComment?: string
  customOrderIds?: string[]
}

const fillTemplate = (tmpl: string, ctx: Record<string, string>) =>
  tmpl.replace(/\{(\w+)\}/g, (_, k) => (ctx[k] ?? ''))

export async function POST(req: Request) {
  try {
    const { enquiryIds = [], templateId, status, extraImages = [], extraComment = '', customOrderIds = [] } = (await req.json()) as Payload
    if ((!enquiryIds?.length && !customOrderIds?.length) || !templateId) {
      return NextResponse.json({ error: 'Missing item ids or templateId' }, { status: 400 })
    }

    // SMTP config
    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT || 587)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const from = process.env.SMTP_FROM || user || 'no-reply@localhost'
    if (!host || !user || !pass) return NextResponse.json({ error: 'SMTP not configured' }, { status: 500 })
    const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })

    const admin = createServiceRoleClient()

    // Load template
    const { data: template, error: tmplErr } = await admin.from('templates').select('id, title, content').eq('id', templateId).single()
    if (tmplErr || !template) throw new Error('Template not found')

    const rows: Array<{
      id: string
      size: string | null
      quantity: number
      material: string | null
      delivery_date: string | null
      comments: string | null
      customer: { company_name: string; email: string | null; phone: string | null } | null
      productName: string
      type: 'product' | 'custom'
    }> = []

    if (enquiryIds.length) {
      const { data, error: eqErr } = await admin
        .from('enquiries')
        .select('id, size, quantity, material, delivery_date, comments, customer:customers(company_name, email, phone), product:products(name)')
        .in('id', enquiryIds)
      if (eqErr) throw eqErr
      for (const r of (data || [])) {
        rows.push({
          id: (r as any).id,
          size: (r as any).size,
          quantity: (r as any).quantity,
          material: (r as any).material,
          delivery_date: (r as any).delivery_date,
          comments: (r as any).comments,
          customer: (r as any).customer,
          productName: (r as any).product?.name || 'Product',
          type: 'product'
        })
      }
    }

    if (customOrderIds.length) {
      const { data, error: coErr } = await admin
        .from('custom_orders')
        .select('id, size, quantity, material, delivery_date, comments, name, customer:customers(company_name, email, phone)')
        .in('id', customOrderIds)
      if (coErr) throw coErr
      for (const r of (data || [])) {
        rows.push({
          id: (r as any).id,
          size: (r as any).size,
          quantity: (r as any).quantity,
          material: (r as any).material,
          delivery_date: (r as any).delivery_date,
          comments: (r as any).comments,
          customer: (r as any).customer,
          productName: `Custom: ${(r as any).name}`,
          type: 'custom'
        })
      }
    }

    if (!rows.length) throw new Error('No matching items')

    interface EnquiryRow {
      id: string
      size: string | null
      quantity: number
      material: string | null
      delivery_date: string | null
      comments: string | null
      customer: { company_name: string; email: string | null; phone: string | null } | null
      product: { name: string } | null
    }
    // Ensure all same company/email
    const companySet = new Set(rows.map(r => r.customer?.company_name || ''))
    const emailSet = new Set(rows.map(r => r.customer?.email || ''))
    if (companySet.size > 1 || emailSet.size > 1) {
      return NextResponse.json({ error: 'Different companies/emails selected. Select a single customer.' }, { status: 400 })
    }

    const to = rows[0].customer?.email
    if (!to) return NextResponse.json({ error: 'Customer has no email' }, { status: 400 })

    // Build body: one section per enquiry using template
    const sections = rows.map((r, idx) => {
      const ctx = {
        customer_name: r.customer?.company_name || '',
        product_name: r.productName || '',
        quotation_id: r.id,
        delivery_date: r.delivery_date || '',
        size: r.size || '',
        material: r.material || '',
        quantity: String(r.quantity || ''),
      }
      const text = fillTemplate(template.content, ctx)
      return `Item ${idx + 1} (${ctx.product_name})${r.type==='custom' ? ' [Custom]':''}\n${text}`
    })

    const subject = `${rows[0].customer?.company_name || 'Customer'} - Enquiry Update (${rows.length} item${rows.length>1?'s':''})`
    const footerLines = [] as string[]
    if (extraComment) footerLines.push(`Admin note: ${extraComment}`)
    if (Array.isArray(extraImages) && extraImages.length) {
      footerLines.push('Attachments/References:')
      footerLines.push(...extraImages.map((u, i) => `  ${i+1}. ${u}`))
    }
    const body = [sections.join('\n\n---\n\n'), footerLines.length ? '\n\n' + footerLines.join('\n') : ''].join('')

    await transporter.sendMail({ from, to, subject, text: body, attachments: (extraImages||[]).map((u, i) => ({ filename: `reference_${i+1}.url.txt`, content: u })) })

    // Update statuses and log
    if (status) {
      if (enquiryIds.length) {
        const { error: upErr } = await admin.from('enquiries').update({ status, reply_template_id: templateId, updated_at: new Date().toISOString() }).in('id', enquiryIds)
        if (upErr) throw upErr
      }
      if (customOrderIds.length) {
        const { error: upErr2 } = await admin.from('custom_orders').update({ status, updated_at: new Date().toISOString() }).in('id', customOrderIds)
        if (upErr2) throw upErr2
      }
    }
    if (enquiryIds.length) {
      await admin.from('enquiry_activity').insert(enquiryIds.map(id => ({ enquiry_id: id, action: 'reply_email', note: `template:${templateId}; status:${status}; images:${(extraImages||[]).length}; comment:${extraComment ? 'y' : 'n'}` })))
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('admin-send-reply error', e)
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 })
  }
}


