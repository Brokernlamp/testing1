'use client'

import { useCart } from '@/components/cart/CartProvider'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function CartPage() {
	const { items, removeItem, clear } = useCart()
	const [submitting, setSubmitting] = useState(false)
	const [department, setDepartment] = useState('')
	const [contact, setContact] = useState('')
	const [delivery, setDelivery] = useState('')
	const [comments, setComments] = useState('')

	const submitAll = async () => {
		if (items.length === 0) return toast.error('Cart is empty')
		if (!department.trim()) return toast.error('Please enter Department')
		setSubmitting(true)
		try {
			const form = new FormData()
			form.append('subject', `Quotation Request - ${items.length} item(s)`) 
			form.append('body', `Department: ${department}\nContact: ${contact}\nDelivery: ${delivery}\nComments: ${comments}`)
			form.append('to', 'shreekrishnasigns@gmail.com')
			// attach a JSON manifest describing items to avoid confusion
			form.append('cart_manifest', JSON.stringify(items.map(({ images, ...rest }) => rest)))
			// attach images grouped per item index
			items.forEach((item, idx) => {
				(item.images || []).forEach((file, fidx) => {
					form.append(`item${idx}_file_${fidx}`, file, `${item.type}-${item.id}-${fidx}-${file.name}`)
				})
			})
			const res = await fetch('/api/send-quotation-email', { method: 'POST', body: form })
			if (!res.ok) throw new Error('Send failed')
			toast.success('Quotation request sent!')
			clear()
		} catch (e) {
			toast.error('Failed to send quotation')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-4">Your Cart</h1>
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
								{i.images && i.images.length > 0 && (
									<p className="text-xs text-gray-500 mt-2">{i.images.length} attachment(s) will be sent with this item</p>
								)}
							</li>
						))}
					</ul>
					<div className="grid md:grid-cols-3 gap-3 mb-4">
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
