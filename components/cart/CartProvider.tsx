'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
	id: string // product id or custom:UUID
	type: 'product' | 'custom'
	name: string
	category?: string | null
	size?: string | null
	quantity: number
	material?: string | null
	delivery_date?: string | null
	comments?: string | null
	images?: File[] // optional, for custom orders or references
}

type CartContextType = {
	items: CartItem[]
	addItem: (item: CartItem) => void
	removeItem: (id: string) => void
	clear: () => void
	updateItem: (id: string, patch: Partial<CartItem>) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([])

	useEffect(() => {
		try {
			const raw = localStorage.getItem('cartItems')
			if (raw) setItems(JSON.parse(raw))
		} catch {}
	}, [])

	useEffect(() => {
		try {
			localStorage.setItem('cartItems', JSON.stringify(items))
		} catch {}
	}, [items])

	const addItem = (item: CartItem) => setItems(prev => [...prev, item])
	const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
	const clear = () => setItems([])
	const updateItem = (id: string, patch: Partial<CartItem>) => setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))

	const value = useMemo(() => ({ items, addItem, removeItem, clear, updateItem }), [items])
	return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
	const ctx = useContext(CartContext)
	if (!ctx) throw new Error('useCart must be used within CartProvider')
	return ctx
}
