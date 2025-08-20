// components/GetQuotationButton.tsx
'use client'
import { Mail } from 'lucide-react'

interface Product {
  name: string
  category?: string | null
  size?: string | null
  material?: string | null
  quantity?: number
}

export default function GetQuotationButton({ product }: { product: Product }) {
  const handleGetQuotation = () => {
    const subject = `Quotation Request for ${product.name}`
    const body = `
Hello,

I would like to request a quotation for:

Product: ${product.name}
Category: ${product.category || 'N/A'}
Size: ${product.size || 'Custom'}
Material: ${product.material || 'Standard'}
Quantity: ${product.quantity || 1}

Please provide pricing and availability.

Thank you!
    `
    
    const mailtoLink = `mailto:swarjadhav325@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, '_blank')
  }

  return (
    <button 
      onClick={handleGetQuotation}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
    >
      <Mail className="h-5 w-5" />
      Get Quotation
    </button>
  )
}
