'use client'

import { Toaster } from 'react-hot-toast'
import { CartProvider } from './cart/CartProvider'

export default function ClientRoot({ children }: { children: React.ReactNode }) {
	return (
		<CartProvider>
			{children}
			<Toaster 
				position="top-center"
				toastOptions={{
					duration: 4000,
					style: { 
						background: '#363636', 
						color: '#fff',
						borderRadius: '8px',
						padding: '12px 16px',
						fontSize: '14px',
						fontWeight: '500'
					},
				}}
			/>
		</CartProvider>
	)
}
