import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

export async function POST(req: Request) {
	try {
		const formData = await req.formData()
		const subject = formData.get('subject') as string
		let body = formData.get('body') as string
		const to = (formData.get('to') as string) || 'shreekrishnasigns@gmail.com'
		const replyTo = (formData.get('reply_to') as string) || undefined

		if (!subject || !body) {
			return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
		}

		const cartManifest = formData.get('cart_manifest') as string | null
		let manifest: any[] | null = null
		if (cartManifest) {
			try {
				manifest = JSON.parse(cartManifest)
				body += `\n\nCart Manifest:\n${JSON.stringify(manifest, null, 2)}`
			} catch {}
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

		const sanitize = (s: string) => s.replace(/[^a-z0-9\- _]/gi, ' ').replace(/\s+/g, ' ').trim()
		const attachments: any[] = []
		for (const [key, value] of Array.from(formData.entries())) {
			const fileLike: any = value
			if (/^item(\d+)_file_(\d+)$/.test(key) && fileLike && typeof fileLike.arrayBuffer === 'function') {
				const [, idxStr, fidxStr] = key.match(/^item(\d+)_file_(\d+)$/) as RegExpMatchArray
				const idx = Number(idxStr)
				const seq = String(Number(fidxStr) + 1).padStart(2, '0')
				const baseName = manifest?.[idx]?.name ? sanitize(String(manifest[idx].name)) : 'Item'
				const original = fileLike.name || 'image'
				const ext = original.includes('.') ? `.${original.split('.').pop()}` : ''
				const filename = `${baseName} ${seq}${ext}`
				const buf = Buffer.from(await fileLike.arrayBuffer())
				attachments.push({ filename, content: buf })
			}
			if (key.startsWith('file_') && fileLike && typeof fileLike.arrayBuffer === 'function') {
				const buf = Buffer.from(await fileLike.arrayBuffer())
				attachments.push({ filename: fileLike.name || key, content: buf })
			}
		}

		await transporter.sendMail({
			from: smtpFrom,
			to,
			replyTo,
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


