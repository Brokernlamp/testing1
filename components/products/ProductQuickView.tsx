'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types/product'
import ProductImageSlider from './ProductImageSlider'

export type QuickViewDetails = {
  size: string | null
  material: string | null
  quantity: number
  comments?: string | null
}

type Props = {
  product: Product
  onClose: () => void
  onAdd: (details: QuickViewDetails) => void
  adding: boolean
}

export default function ProductQuickView({ product, onClose, onAdd, adding }: Props) {
  const [sizeChoice, setSizeChoice] = useState('')
  const [customSize, setCustomSize] = useState({ h: '', w: '', unit: 'inch' })
  const [materialChoice, setMaterialChoice] = useState('')
  const [customMaterial, setCustomMaterial] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [comments, setComments] = useState('')

  useEffect(() => {
    setSizeChoice(product.sizes?.[0] || '')
    setMaterialChoice(product.materials?.[0] || '')
    setCustomSize({ h: '', w: '', unit: 'inch' })
    setCustomMaterial('')
    setQuantity(1)
    setComments('')
  }, [product])

  const formatCustomSize = () => {
    if (!customSize.h || !customSize.w) return ''
    return `${customSize.h} x ${customSize.w} ${customSize.unit}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quantity < 1) {
      toast.error('Quantity must be at least 1')
      return
    }

    let resolvedSize: string | null = sizeChoice || null
    if (sizeChoice === 'custom') {
      const formatted = formatCustomSize()
      if (!formatted.trim()) {
        toast.error('Enter custom size dimensions')
        return
      }
      resolvedSize = formatted
    }

    if (!resolvedSize) {
      toast.error('Please select a size')
      return
    }

    let resolvedMaterial: string | null = materialChoice || null
    if (materialChoice === 'custom') {
      if (!customMaterial.trim()) {
        toast.error('Enter a custom material')
        return
      }
      resolvedMaterial = customMaterial.trim()
    }

    onAdd({
      size: resolvedSize,
      material: resolvedMaterial,
      quantity,
      comments: comments.trim() || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/70 px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">Get Quote</p>
            <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close quick view"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border bg-gray-50 p-4">
              {product.image_url ? (
                <ProductImageSlider imageUrls={product.image_url} productName={product.name} />
              ) : (
                <div className="aspect-[4/3] flex items-center justify-center text-gray-500 text-sm">
                  Image coming soon
                </div>
              )}
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p>{product.description || 'High quality signage solution from Shree Krishna Signs.'}</p>
              {product.category?.name && (
                <div>
                  <p className="font-medium text-gray-900">Category</p>
                  <p>{product.category.name}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
              <div className="space-y-2">
                <select
                  className="input-field"
                  value={sizeChoice}
                  onChange={(e) => setSizeChoice(e.target.value)}
                >
                  <option value="">Select size</option>
                  {(product.sizes || []).map((size, index) => (
                    <option key={`${size}-${index}`} value={size}>{size}</option>
                  ))}
                  <option value="custom">Custom size</option>
                </select>
                {sizeChoice === 'custom' && (
                  <div className="grid grid-cols-5 gap-2">
                    <input
                      className="input-field col-span-2"
                      placeholder="Height"
                      value={customSize.h}
                      onChange={(e) => setCustomSize({ ...customSize, h: e.target.value })}
                    />
                    <input
                      className="input-field col-span-2"
                      placeholder="Width"
                      value={customSize.w}
                      onChange={(e) => setCustomSize({ ...customSize, w: e.target.value })}
                    />
                    <select
                      className="input-field col-span-1"
                      value={customSize.unit}
                      onChange={(e) => setCustomSize({ ...customSize, unit: e.target.value })}
                    >
                      <option value="inch">inch</option>
                      <option value="cm">cm</option>
                      <option value="mm">mm</option>
                      <option value="ft">ft</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <div className="space-y-2">
                <select
                  className="input-field"
                  value={materialChoice}
                  onChange={(e) => setMaterialChoice(e.target.value)}
                >
                  <option value="">Select material</option>
                  {(product.materials || []).map((material, index) => (
                    <option key={`${material}-${index}`} value={material}>{material}</option>
                  ))}
                  <option value="custom">Custom material</option>
                </select>
                {materialChoice === 'custom' && (
                  <input
                    className="input-field"
                    placeholder="Enter custom material"
                    value={customMaterial}
                    onChange={(e) => setCustomMaterial(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={quantity}
                onChange={(e) => {
                  const nextValue = parseInt(e.target.value || '1', 10)
                  setQuantity(Number.isNaN(nextValue) ? 1 : Math.max(1, nextValue))
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <input
                className="input-field"
                placeholder="Any notes for this item"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={adding}
          >
            {adding ? 'Adding…' : 'Add to Cart'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Close
          </button>
        </div>
      </form>
    </div>
  )
}

