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

		// Validate SMTP configuration
		const smtpHost = process.env.SMTP_HOST
		const smtpPort = Number(process.env.SMTP_PORT || 587)
		const smtpUser = process.env.SMTP_USER
		const smtpPass = process.env.SMTP_PASS
		const smtpFrom = process.env.SMTP_FROM || smtpUser || 'no-reply@localhost'

		if (!smtpHost || !smtpUser || !smtpPass) {
			return NextResponse.json({ error: 'SMTP is not configured on the server' }, { status: 500 })
		}

		const transporter = nodemailer.createTransport({
			host: smtpHost,
			port: smtpPort,
			secure: smtpPort === 465,
			auth: { user: smtpUser, pass: smtpPass },
		})

		const attachments: any[] = []
		for (const [key, value] of Array.from(formData.entries())) {
			// Accept File-like values that support arrayBuffer()
			const fileLike: any = value
			if (key.startsWith('file_') && fileLike && typeof fileLike.arrayBuffer === 'function') {
				const buf = Buffer.from(await fileLike.arrayBuffer())
				attachments.push({ filename: fileLike.name || 'attachment', content: buf })
			}
		}

		await transporter.sendMail({
			from: smtpFrom,
			to,
			subject,
			text: body,
			attachments,
		})

		return NextResponse.json({ ok: true })
	} catch (e: any) {
		console.error('send-quotation-email error', e)
		return NextResponse.json({ error: e?.message || 'Failed to send' }, { status: 500 })
	}
}


