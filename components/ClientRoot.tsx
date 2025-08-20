'use client'

import { Toaster } from 'react-hot-toast'
import { CartProvider } from './cart/CartProvider'

export default function ClientRoot({ children }: { children: React.ReactNode }) {
	return (
		<CartProvider>
			{children}
			<Toaster 
				position="top-right"
				toastOptions={{
					duration: 4000,
					style: { background: '#363636', color: '#fff' },
				}}
			/>
		</CartProvider>
	)
}
