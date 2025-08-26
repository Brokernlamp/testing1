'use client'

import { useCart } from './cart/CartProvider'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

export default function CartButton() {
	const { items } = useCart()
	const itemCount = items.length

	return (
		<Link 
			href="/cart" 
			className="relative inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
		>
			<ShoppingCart className="h-5 w-5" />
			<span>Cart</span>
			{itemCount > 0 && (
				<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
					{itemCount}
				</span>
			)}
		</Link>
	)
}
