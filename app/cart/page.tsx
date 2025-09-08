'use client'

import { useCart } from '@/components/cart/CartProvider'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function CartPage() {
	const { items, removeItem, clear, updateItem } = useCart()
	const [submitting, setSubmitting] = useState(false)
	const [company, setCompany] = useState('')
	const [email, setEmail] = useState('')
	const [department, setDepartment] = useState('')
	const [contact, setContact] = useState('')
	const [delivery, setDelivery] = useState('')
	const [comments, setComments] = useState('')

	// Companies dropdown
	const [companies, setCompanies] = useState<Array<{ id: string; company_name: string }>>([])
	const [useCustomCompany, setUseCustomCompany] = useState(false)

	useEffect(() => {
		const fetchCompanies = async () => {
			const { data, error } = await supabase
				.from('customers')
				.select('id, company_name')
				.order('company_name')
			if (!error) setCompanies(data || [])
		}
		fetchCompanies()
	}, [])

	const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])

	const handleGetQuotation = async () => {
		if (items.length === 0) return toast.error('Cart is empty')
		if (!company.trim()) return toast.error('Please enter Company Name')
		if (!department.trim()) return toast.error('Please enter Department')
		if (!email.trim()) return toast.error('Please enter Customer Email')
		if (!email.includes('@')) return toast.error('Please enter a valid email with @')
		if (delivery && delivery < todayStr) return toast.error('Delivery date cannot be in the past')

		setSubmitting(true)
		
		try {
			// 1) Save to database first
			const createPayload = {
				company_name: company.trim(),
				email: email.trim() || null,
				department: department.trim(),
				contact: contact.trim(),
				delivery,
				comments,
				items: items.map(({ id, type, name, size, quantity, material, comments: itemComments, images }) => ({ 
					id, type, name, size, quantity, material, comments: itemComments, images 
				})),
			}
			
			const dbRes = await fetch('/api/cart-enquiries', { 
				method: 'POST', 
				headers: { 'Content-Type': 'application/json' }, 
				body: JSON.stringify(createPayload) 
			})
			
			if (!dbRes.ok) {
				let msg = 'Failed to save order to database'
				try { const data = await dbRes.json(); msg = data?.error || msg } catch {}
				throw new Error(msg)
			}

			const result = await dbRes.json()
			
			// 2) Generate order IDs for email
			const regularOrders = items.filter(item => item.type === 'product')
			const customOrders = items.filter(item => item.type === 'custom')
			
			const regularOrderIds = regularOrders.map((_, index) => `ORD-${Date.now()}-${index + 1}`)
			const customOrderIds = customOrders.map((_, index) => `CUST-${Date.now()}-${index + 1}`)

			// 3) Create email content
			const subject = `Quotation Request - ${items.length} item(s) from ${company}`
			
			const emailBody = [
				`Dear Shree Krishna Signs,`,
				``,
				`I would like to request a quotation for the following items:`,
				``,
				`**Customer Details:**`,
				`Company: ${company}`,
				`Department: ${department}`,
				`Email: ${email}`,
				`Contact: ${contact || 'Not provided'}`,
				`Delivery Date: ${delivery || 'Not specified'}`,
				``,
				`**Order Summary:**`,
				`Total Items: ${items.length}`,
				`Regular Products: ${regularOrders.length}`,
				`Custom Orders: ${customOrders.length}`,
				``,
				`**Items Details:**`,
				``,
				...items.map((item, idx) => {
					const orderId = item.type === 'product' 
						? regularOrderIds[regularOrders.findIndex(p => p.id === item.id)] 
						: customOrderIds[customOrders.findIndex(c => c.id === item.id)]
					
					return [
						`${idx + 1}. ${item.type === 'product' ? 'Product' : 'Custom Order'}`,
						`   Order ID: ${orderId}`,
						`   Name: ${item.name}`,
						`   Size: ${item.size || 'Not specified'}`,
						`   Material: ${item.material || 'Not specified'}`,
						`   Quantity: ${item.quantity}`,
						`   Comments: ${item.comments || 'None'}`,
						...(item.images && item.images.length > 0 ? [
							`   Reference Images:`,
							...item.images.map((img, imgIdx) => `      ${imgIdx + 1}. ${img}`)
						] : []),
						``
					].join('\n')
				}),
				`**Additional Comments:**`,
				comments || 'None',
				``,
				`Please provide pricing and availability for these items.`,
				``,
				`Thank you!`,
				`${company}`,
				`${department}`
			].join('\n')

			// 4) Open email client
			const mailtoLink = `mailto:shreekrishnasigns@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`
			window.open(mailtoLink, '_blank')
			
			// 5) Show success message and clear cart
			toast.success(`Order saved! ${result.regularOrders} regular orders, ${result.customOrders} custom orders. Email client opened.`)
			clear()
			
		} catch (e: any) {
			toast.error(e?.message || 'Failed to process quotation request')
		} finally {
			setSubmitting(false)
		}
	}



	return (
		<div className="max-w-5xl mx-auto px-4 py-8" style={{ background: 'linear-gradient(135deg, #F8FFFE 0%, #E8F5E8 50%, #E3F2FD 100%)' }}>
			{/* Navigation Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
				<div className="flex flex-wrap items-center gap-2 sm:gap-4">
					<Link 
						href="/" 
						className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors text-xs sm:text-sm whitespace-nowrap"
					>
						<ArrowLeft className="h-4 w-4" />
						Home
					</Link>
					<Link 
						href="/products" 
						className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-xs sm:text-sm whitespace-nowrap"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Products
					</Link>
					<Link 
						href="/custom-order" 
						className="flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors text-xs sm:text-sm whitespace-nowrap"
					>
						<ShoppingBag className="h-4 w-4" />
						Custom Order
					</Link>
				</div>
				<h1 className="text-xl sm:text-2xl font-bold">Your Cart</h1>
				{items.length > 0 && (
					<button className="text-xs sm:text-sm text-red-600 hover:text-red-800" onClick={clear}>
						Clear all
					</button>
				)}
			</div>

			{items.length === 0 ? (
				<div className="text-center py-12">
					<ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
					<div className="flex gap-4 justify-center">
						<Link href="/products" className="btn-primary">
							Browse Products
						</Link>
						<Link href="/custom-order" className="btn-secondary">
							Create Custom Order
						</Link>
					</div>
				</div>
			) : (
				<>
					<ul className="space-y-3 mb-6">
						{items.map((i, idx) => (
							<li key={i.id} className="p-4 border rounded-md bg-white shadow-sm">
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<span className={`px-2 py-1 text-xs rounded-full ${
												i.type === 'product' 
													? 'bg-blue-100 text-blue-800' 
													: 'bg-green-100 text-green-800'
											}`}>
												{i.type === 'product' ? 'Product' : 'Custom'}
											</span>
											<p className="font-medium">{i.name}</p>
										</div>
										<p className="text-sm text-gray-600">
											Qty: {i.quantity} {i.size ? `| Size: ${i.size}` : ''} {i.material ? `| Material: ${i.material}` : ''}
										</p>
									</div>
									<button 
										className="text-red-600 hover:text-red-800 transition-colors" 
										onClick={() => removeItem(i.id)}
									>
										Remove
									</button>
								</div>
								
								<div className="grid md:grid-cols-4 gap-2 mt-3">
									<input 
										className="input-field" 
										placeholder="Size (e.g. 34*23 inch)" 
										value={i.size || ''} 
										onChange={(e)=>updateItem(i.id,{size:e.target.value})} 
									/>
									<input 
										className="input-field" 
										placeholder="Material" 
										value={i.material || ''} 
										onChange={(e)=>updateItem(i.id,{material:e.target.value})} 
									/>
									<input 
										className="input-field" 
										type="number" 
										min={1} 
										value={i.quantity} 
										onChange={(e)=>updateItem(i.id,{quantity:parseInt(e.target.value||'1')})} 
									/>
									<input 
										className="input-field" 
										placeholder="Comments" 
										value={i.comments || ''} 
										onChange={(e)=>updateItem(i.id,{comments:e.target.value})} 
									/>
								</div>
								
								{/* Display image URLs */}
								{i.images && i.images.length > 0 && (
									<div className="mt-3">
										<p className="text-sm font-medium mb-2">Reference Images:</p>
										<div className="flex flex-wrap gap-2">
											{i.images.map((imageUrl, index) => (
												<img 
													key={index}
													src={imageUrl} 
													alt={`Reference ${index + 1}`} 
													className="w-20 h-20 object-cover rounded border"
												/>
											))}
										</div>
									</div>
								)}
							</li>
						))}
					</ul>

					{/* Customer Details Form */}
					<div className="bg-gray-50 p-6 rounded-lg mb-6">
						<h3 className="text-lg font-semibold mb-4">Customer Details</h3>
						<div className="grid md:grid-cols-5 gap-3 mb-4">
							{/* Company selector */}
							{!useCustomCompany ? (
								<select
									className="input-field min-h-[44px]"
									value={company}
									onChange={(e)=>{
										const v = e.target.value
										if (v === '__create_new__') { setUseCustomCompany(true); setCompany(''); return }
										setCompany(v)
									}}
								>
									<option value="">Select Company *</option>
									{companies.map(c => (
										<option key={c.id} value={c.company_name}>{c.company_name}</option>
									))}
									<option value="__create_new__">+ Create new…</option>
								</select>
							) : (
								<input 
									className="input-field" 
									placeholder="Enter Company Name *" 
									value={company} 
									onChange={(e)=>setCompany(e.target.value)} 
								/>
							)}
							<input 
								className="input-field" 
								type="email" 
								placeholder="Customer Email *" 
								value={email} 
								onChange={(e)=>setEmail(e.target.value)} 
							/>
							<input 
								className="input-field" 
								placeholder="Department *" 
								value={department} 
								onChange={(e)=>setDepartment(e.target.value)} 
							/>
							<input 
								className="input-field" 
								placeholder="Contact Number" 
								value={contact} 
								onChange={(e)=>setContact(e.target.value)} 
							/>
							<input 
								className="input-field" 
								type="date" 
								min={todayStr}
								value={delivery} 
								onChange={(e)=>setDelivery(e.target.value)} 
							/>
						</div>
						<p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 md:col-span-5">
							We will proceed order dispatch after purchase order only
						</p>
						<textarea 
							className="input-field w-full" 
							rows={3} 
							placeholder="Additional comments" 
							value={comments} 
							onChange={(e)=>setComments(e.target.value)} 
						/>
					</div>

					{/* Action Button */}
					<div className="flex justify-center">
						<button 
							className="btn-primary flex items-center gap-2 px-8 py-3 text-lg" 
							onClick={handleGetQuotation}
							disabled={submitting}
						>
							<Mail className="h-5 w-5" />
							{submitting ? 'Processing...' : 'Get Quotation'}
						</button>
					</div>
				</>
			)}
		</div>
	)
}
