import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const subject = formData.get('subject') as string
    const body = formData.get('body') as string
    const to = (formData.get('to') as string) || 'shreekrishnasigns@gmail.com'

    if (!subject || !body) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const attachments: any[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File) {
        const buf = Buffer.from(await value.arrayBuffer())
        attachments.push({ filename: value.name, content: buf })
      }
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to,
      subject,
      text: body,
      attachments,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('send-quotation-email error', e)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}


