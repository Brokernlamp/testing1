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
	const [sizeDrafts, setSizeDrafts] = useState<Record<string, { height: string; width: string; unit: string }>>({})
	const [materialDrafts, setMaterialDrafts] = useState<Record<string, string>>({})

	// Companies dropdown
	const [companies, setCompanies] = useState<Array<{ id: string; company_name: string }>>([])
	const [useCustomCompany, setUseCustomCompany] = useState(false)

	useEffect(() => {
		setSizeDrafts((prev) => {
			const next = { ...prev }
			let changed = false
			Object.keys(next).forEach((key) => {
				if (!items.find((item) => item.id === key)) {
					delete next[key]
					changed = true
				}
			})
			return changed ? next : prev
		})
		setMaterialDrafts((prev) => {
			const next = { ...prev }
			let changed = false
			Object.keys(next).forEach((key) => {
				if (!items.find((item) => item.id === key)) {
					delete next[key]
					changed = true
				}
			})
			return changed ? next : prev
		})
	}, [items])

	const updateSizeDraft = (id: string, patch: Partial<{ height: string; width: string; unit: string }>) => {
		setSizeDrafts((prev) => {
			const current = prev[id] || { height: '', width: '', unit: 'inch' }
			return { ...prev, [id]: { ...current, ...patch } }
		})
	}

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
							`   ImageKit Links:`,
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

			const manifestPayload = items.map((item) => ({
				...item,
				imageCount: item.images?.length || 0,
			}))

			const sendEmail = async () => {
				const formData = new FormData()
				formData.append('subject', subject)
				formData.append('body', emailBody)
				formData.append('reply_to', email.trim())
				formData.append('to', 'shreekrishnasigns@gmail.com')
				formData.append('cart_manifest', JSON.stringify(manifestPayload))
				const emailRes = await fetch('/api/send-quotation-email', {
					method: 'POST',
					body: formData,
				})
				if (!emailRes.ok) {
					let message = 'Failed to email quotation'
					try {
						const payload = await emailRes.json()
						message = payload?.error || message
					} catch {}
					throw new Error(message)
				}
			}

			let emailSent = false
			try {
				await sendEmail()
				emailSent = true
			} catch (err) {
				console.error('send-email error', err)
				const fallbackLink = `mailto:shreekrishnasigns@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`
				window.open(fallbackLink, '_blank')
				toast.error('Quotation email service unavailable. Opened your email client instead.')
			}

			if (emailSent) {
				toast.success(`Order saved & emailed with ImageKit links! ${result.regularOrders} regular and ${result.customOrders} custom items.`)
			}
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
						{items.map((i, idx) => {
							const needsSize = !(i.size || '').trim()
							const needsMaterial = !(i.material || '').trim()
							return (
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
											placeholder="Size (e.g. 34*23 inch) or use builder below" 
											value={i.size || ''} 
											onChange={(e)=>updateItem(i.id,{size:e.target.value})} 
										/>
										<input 
											className="input-field" 
											placeholder="Material (type custom or pick below)" 
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

								{(needsSize || needsMaterial) && (
									<div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 flex flex-col gap-1">
										<p className="font-semibold tracking-wide uppercase">
											Missing details detected
										</p>
										<p>
											{needsSize && 'Size '}
											{needsSize && needsMaterial && 'and '}
											{needsMaterial && 'Material '}
											{(needsSize && !needsMaterial) || (!needsSize && needsMaterial) ? 'is' : 'are'} required for an accurate quotation. Use the custom builders below to fill them in.
										</p>
									</div>
								)}
								
									<div className="mt-3 space-y-3">
										<div className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
											<span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-[10px]">i</span>
											<span>Customize size & material below</span>
										</div>
										<div className={`p-3 border border-dashed rounded-lg ${needsSize ? 'border-amber-300 bg-amber-50/70' : 'border-gray-300 bg-gray-50'}`}>
											<div className="flex items-center justify-between">
												<p className="text-sm font-semibold text-gray-700">Custom Size Builder</p>
												<button
													type="button"
													onClick={() => {
														const draft = sizeDrafts[i.id] || { height: '', width: '', unit: 'inch' }
														if (!draft.height || !draft.width) {
															toast.error('Enter both height and width to apply custom size')
															return
														}
														const formatted = `${draft.height} x ${draft.width} ${draft.unit}`
														updateItem(i.id, { size: formatted })
														toast.success('Custom size applied to item')
													}}
													className="text-xs font-semibold text-primary-600 hover:text-primary-800"
												>
													Apply
												</button>
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-2">
												<input
													className="input-field sm:col-span-2"
													placeholder="Height"
													value={(sizeDrafts[i.id]?.height) || ''}
													onChange={(e)=>updateSizeDraft(i.id,{height:e.target.value})}
												/>
												<input
													className="input-field sm:col-span-2"
													placeholder="Width"
													value={(sizeDrafts[i.id]?.width) || ''}
													onChange={(e)=>updateSizeDraft(i.id,{width:e.target.value})}
												/>
												<select
													className="input-field sm:col-span-1"
													value={(sizeDrafts[i.id]?.unit) || 'inch'}
													onChange={(e)=>updateSizeDraft(i.id,{unit:e.target.value})}
												>
													<option value="inch">inch</option>
													<option value="cm">cm</option>
													<option value="mm">mm</option>
													<option value="ft">ft</option>
												</select>
											</div>
											<p className="text-xs text-gray-500 mt-2">Result will be saved to the Size field above.</p>
										</div>

										<div className={`p-3 border border-dashed rounded-lg ${needsMaterial ? 'border-amber-300 bg-amber-50/70' : 'border-gray-300 bg-gray-50'}`}>
											<p className="text-sm font-semibold text-gray-700 mb-2">Material Options</p>
											<div className="flex flex-wrap gap-2 mb-3">
												{['ACP', 'Acrylic', 'Vinyl', 'Sunboard', 'Steel', 'Flex'].map((materialOption) => (
													<button
														type="button"
														key={materialOption}
														onClick={() => updateItem(i.id,{ material: materialOption })}
														className={`px-3 py-1 text-xs rounded-full border transition-colors ${
															i.material === materialOption
																? 'border-primary-500 bg-primary-50 text-primary-700'
																: 'border-gray-300 text-gray-600 hover:border-primary-300'
														}`}
													>
														{materialOption}
													</button>
												))}
											</div>
											<div className="flex flex-col sm:flex-row gap-2">
												<input
													className="input-field"
													placeholder="Custom material"
													value={materialDrafts[i.id] ?? ''}
													onChange={(e)=>setMaterialDrafts(prev => ({ ...prev, [i.id]: e.target.value }))}
												/>
												<button
													type="button"
													onClick={() => {
														const custom = (materialDrafts[i.id] || '').trim()
														if (!custom) {
															toast.error('Enter a custom material first')
															return
														}
														updateItem(i.id, { material: custom })
														toast.success('Custom material applied')
													}}
													className="px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-lg w-full sm:w-auto"
												>
													Set
												</button>
											</div>
										</div>
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
							)
						})}
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
					<div className="flex flex-col items-center gap-3">
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
