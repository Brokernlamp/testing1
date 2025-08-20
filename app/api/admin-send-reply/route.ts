import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createServiceRoleClient } from '@/lib/supabase'

export const runtime = 'nodejs'

type Payload = {
  enquiryIds: string[]
  templateId: string
  status: string
}

const fillTemplate = (tmpl: string, ctx: Record<string, string>) =>
  tmpl.replace(/\{(\w+)\}/g, (_, k) => (ctx[k] ?? ''))

export async function POST(req: Request) {
  try {
    const { enquiryIds, templateId, status } = (await req.json()) as Payload
    if (!enquiryIds?.length || !templateId) {
      return NextResponse.json({ error: 'Missing enquiryIds or templateId' }, { status: 400 })
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

    // Load enquiries with joins
    const { data, error: eqErr } = await admin
      .from('enquiries')
      .select('id, size, quantity, material, delivery_date, comments, customer:customers(company_name, email, phone), product:products(name)')
      .in('id', enquiryIds)

    if (eqErr) throw eqErr
    if (!data || data.length === 0) throw new Error('Enquiries not found')

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
    const rows = data as unknown as EnquiryRow[]

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
        product_name: r.product?.name || '',
        quotation_id: r.id,
        delivery_date: r.delivery_date || '',
        size: r.size || '',
        material: r.material || '',
        quantity: String(r.quantity || ''),
      }
      const text = fillTemplate(template.content, ctx)
      return `Item ${idx + 1} (${ctx.product_name})\n${text}`
    })

    const subject = `${rows[0].customer?.company_name || 'Customer'} - Enquiry Update (${rows.length} item${rows.length>1?'s':''})`
    const body = sections.join('\n\n---\n\n')

    await transporter.sendMail({ from, to, subject, text: body })

    // Update statuses and log
    if (status) {
      const { error: upErr } = await admin.from('enquiries').update({ status, reply_template_id: templateId, updated_at: new Date().toISOString() }).in('id', enquiryIds)
      if (upErr) throw upErr
    }
    await admin.from('enquiry_activity').insert(enquiryIds.map(id => ({ enquiry_id: id, action: 'reply_email', note: `template:${templateId}; status:${status}` })))

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('admin-send-reply error', e)
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 })
  }
}


