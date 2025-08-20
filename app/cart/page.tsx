'use client'

import { useCart } from '@/components/cart/CartProvider'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function CartPage() {
	const { items, removeItem, clear, updateItem } = useCart()
	const [submitting, setSubmitting] = useState(false)
	const [company, setCompany] = useState('')
	const [email, setEmail] = useState('')
	const [department, setDepartment] = useState('')
	const [contact, setContact] = useState('')
	const [delivery, setDelivery] = useState('')
	const [comments, setComments] = useState('')

	const submitAll = async () => {
		if (items.length === 0) return toast.error('Cart is empty')
		if (!company.trim()) return toast.error('Please enter Company Name')
		if (!department.trim()) return toast.error('Please enter Department')
		setSubmitting(true)
		try {
			// 1) Create enquiries in DB (so they appear on dashboard)
			const createPayload = {
				company_name: company.trim(),
				email: email.trim() || null,
				department: department.trim(),
				contact: contact.trim(),
				delivery,
				comments,
				items: items.map(({ id, type, name, size, quantity, material, comments: itemComments }) => ({ id, type, name, size, quantity, material, comments: itemComments })),
			}
			const dbRes = await fetch('/api/cart-enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createPayload) })
			if (!dbRes.ok) {
				let msg = 'Failed to create enquiries in database'
				try { const data = await dbRes.json(); msg = data?.error || msg } catch {}
				throw new Error(msg)
			}

			const form = new FormData()
			form.append('subject', `Quotation Request - ${items.length} item(s)`) 
			form.append('body', `Company: ${company}\nEmail: ${email}\nDepartment: ${department}\nContact: ${contact}\nDelivery: ${delivery}\nComments: ${comments}`)
			form.append('to', 'shreekrishnasigns@gmail.com')
			if (email) form.append('reply_to', email)
			// attach a JSON manifest describing items to avoid confusion
			form.append('cart_manifest', JSON.stringify(items.map(({ images, ...rest }) => rest)))
			// attach images grouped per item index (only real File/Blob)
			const isBlobLike = (v: any) => (typeof File !== 'undefined' && v instanceof File) || (typeof Blob !== 'undefined' && v instanceof Blob)
			items.forEach((item, idx) => {
				(item.images || []).forEach((file: any, fidx) => {
					if (!isBlobLike(file)) return
					const filename = `${item.type}-${item.id}-${fidx}-${(file as any).name || 'image'}`
					form.append(`item${idx}_file_${fidx}`, file as Blob, filename)
				})
			})
			const res = await fetch('/api/send-quotation-email', { method: 'POST', body: form })
			if (!res.ok) {
				let msg = 'Send failed'
				try { const data = await res.json(); msg = data?.error || msg } catch {}
				throw new Error(msg)
			}
			toast.success('Quotation request sent!')
			clear()
		} catch (e: any) {
			toast.error(e?.message || 'Failed to send quotation')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-bold">Your Cart</h1>
				{items.length > 0 && <button className="text-sm text-red-600" onClick={clear}>Clear all</button>}
			</div>
			{items.length === 0 ? (
				<p className="text-gray-600">No items added.</p>
			) : (
				<>
					<ul className="space-y-3 mb-6">
						{items.map((i, idx) => (
							<li key={i.id} className="p-4 border rounded-md bg-white">
								<div className="flex justify-between">
									<div>
										<p className="font-medium">{i.type === 'product' ? i.name : `Custom: ${i.name}`}</p>
										<p className="text-sm text-gray-600">Qty: {i.quantity} {i.size ? `| Size: ${i.size}` : ''} {i.material ? `| Material: ${i.material}` : ''}</p>
									</div>
									<button className="text-red-600" onClick={() => removeItem(i.id)}>Remove</button>
								</div>
								<div className="grid md:grid-cols-4 gap-2 mt-3">
									<input className="input-field" placeholder="Size (e.g. 34*23 inch)" value={i.size || ''} onChange={(e)=>updateItem(i.id,{size:e.target.value})} />
									<input className="input-field" placeholder="Material" value={i.material || ''} onChange={(e)=>updateItem(i.id,{material:e.target.value})} />
									<input className="input-field" type="number" min={1} value={i.quantity} onChange={(e)=>updateItem(i.id,{quantity:parseInt(e.target.value||'1')})} />
									<input className="input-field" placeholder="Comments" value={i.comments || ''} onChange={(e)=>updateItem(i.id,{comments:e.target.value})} />
								</div>
								<div className="mt-2">
									<input type="file" multiple accept="image/*" onChange={(e)=>{
										const more = Array.from(e.target.files||[])
										updateItem(i.id,{ images: [...(i.images||[]), ...more] })
									}} />
								</div>
								{i.images && i.images.length > 0 && (
									<p className="text-xs text-gray-500 mt-2">{i.images.length} attachment(s) will be sent with this item</p>
								)}
							</li>
						))}
					</ul>
					<div className="grid md:grid-cols-5 gap-3 mb-4">
						<input className="input-field" placeholder="Company Name" value={company} onChange={(e)=>setCompany(e.target.value)} />
						<input className="input-field" type="email" placeholder="Customer Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
						<input className="input-field" placeholder="Department" value={department} onChange={(e)=>setDepartment(e.target.value)} />
						<input className="input-field" placeholder="Contact Number" value={contact} onChange={(e)=>setContact(e.target.value)} />
						<input className="input-field" type="date" value={delivery} onChange={(e)=>setDelivery(e.target.value)} />
					</div>
					<textarea className="input-field w-full mb-4" rows={3} placeholder="Additional comments" value={comments} onChange={(e)=>setComments(e.target.value)} />
					<button className="btn-primary" onClick={submitAll} disabled={submitting}>{submitting ? 'Sending...' : 'Get Quotation for All'}</button>
				</>
			)}
		</div>
	)
}
