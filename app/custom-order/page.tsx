'use client'

import { useCart } from '@/components/cart/CartProvider'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import toast from 'react-hot-toast'

export default function CustomOrderPage() {
	const { addItem } = useCart()
	const [items, setItems] = useState<Array<{ id: string; name: string; size: string; unit: string; material: string; quantity: number; images: File[] }>>([
		{ id: uuid(), name: '', size: '', unit: '', material: '', quantity: 1, images: [] },
	])

	const addRow = () => setItems(prev => [...prev, { id: uuid(), name: '', size: '', unit: '', material: '', quantity: 1, images: [] }])
	const removeRow = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

	const update = (id: string, patch: Partial<{ name: string; size: string; unit: string; material: string; quantity: number; images: File[] }>) =>
		setItems(prev => prev.map(i => (i.id === id ? { ...i, ...patch } : i)))

	const addAllToCart = () => {
		let added = 0
		for (const i of items) {
			if (!i.name.trim()) continue
			addItem({
				id: 'custom:' + i.id,
				type: 'custom',
				name: i.name.trim(),
				size: i.size ? `${i.size}${i.unit ? ' ' + i.unit : ''}` : null,
				quantity: i.quantity,
				material: i.material || null,
				images: i.images,
			})
			added++
		}
		if (added === 0) return toast.error('Add at least one custom item name')
		toast.success(`Added ${added} item(s) to cart`)
	}

	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-2">Custom Order</h1>
			<p className="text-gray-600 mb-6">Add multiple custom items with size units and photos. All will be grouped per item in the quotation email.</p>
			<div className="space-y-4">
				{items.map((row) => (
					<div key={row.id} className="p-4 border rounded-md bg-white">
						<div className="grid md:grid-cols-6 gap-3 items-center">
							<input className="input-field" placeholder="Item name" value={row.name} onChange={(e)=>update(row.id,{name:e.target.value})} />
							<input className="input-field" placeholder="Size (e.g. 34*23)" value={row.size} onChange={(e)=>update(row.id,{size:e.target.value})} />
							<select className="input-field" value={row.unit} onChange={(e)=>update(row.id,{unit:e.target.value})}>
								<option value="">Unit</option>
								<option value="inch">inch</option>
								<option value="cm">cm</option>
								<option value="mm">mm</option>
								<option value="ft">ft</option>
							</select>
							<input className="input-field" placeholder="Custom material" value={row.material} onChange={(e)=>update(row.id,{material:e.target.value})} />
							<input className="input-field" type="number" min={1} value={row.quantity} onChange={(e)=>update(row.id,{quantity:parseInt(e.target.value||'1')})} />
							<input className="" type="file" multiple accept="image/*" onChange={(e)=>update(row.id,{images:Array.from(e.target.files||[])})} />
						</div>
						<div className="mt-2 flex items-center justify-between">
							<button className="text-red-600" onClick={()=>removeRow(row.id)}>Remove</button>
							<div className="text-xs text-gray-500">
								Example size: <button className="underline" type="button" onClick={()=>update(row.id,{size:'34*23', unit:'inch'})}>34*23 inch</button>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="flex gap-3 mt-6">
				<button className="btn-secondary" onClick={addRow}>+ Add another</button>
				<button className="btn-primary" onClick={addAllToCart}>Add all to Cart</button>
			</div>
		</div>
	)
}
