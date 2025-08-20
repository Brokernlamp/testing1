'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart, Package, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useCart } from '@/components/cart/CartProvider'
import ImageUpload from '@/components/ImageUpload'
import GetQuotationButton from '@/components/GetQuotationButton'

interface Product {
  id: string
  name: string
  description: string | null
  category_id: string

  image_url: string | null
  sizes: string[] | null
  materials: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
  category: {
    name: string
  }
}

// No form interface here anymore; details are collected in Cart

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddToCart, setShowAddToCart] = useState(false)
  const [quantity, setQuantity] = useState<number>(1)

  const [size, setSize] = useState<string>('')
  const [material, setMaterial] = useState<string>('')
  const [customSize, setCustomSize] = useState<{h: string; w: string; unit: string}>({ h: '', w: '', unit: 'inch' })
  const [customMaterial, setCustomMaterial] = useState<string>('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .single()

      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Product not found')
      router.push('/products')
    } finally {
      setLoading(false)
    }
  }

  // Product page now only collects quantity and optional reference photos; all other details are asked in Cart

  const handleImageUploadSuccess = (imageUrl: string) => {
    setUploadedImages(prev => [...prev, imageUrl])
  }

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault()

    if (!product) return

    const resolvedSize = size === 'custom' ? `${customSize.h}x${customSize.w} ${customSize.unit}`.trim() : size || null
    const resolvedMaterial = material === 'custom' ? (customMaterial || null) : (material || null)

    addItem({
      id: product.id + ':' + Date.now(),
      type: 'product',
      name: product.name,
      category: product.category?.name || null,
      size: resolvedSize,
      quantity: quantity,
      material: resolvedMaterial,
      delivery_date: null,
      comments: null,
      images: uploadedImages,
    })
    toast.success('Added to cart')
    setShowAddToCart(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Product not found</p>
          <button
            onClick={() => router.push('/products')}
            className="btn-primary mt-4"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/products')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Product Details</h1>
                <p className="text-sm text-gray-600">Add this product to your cart</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-700 hover:text-primary-600 font-medium">
                Home
              </a>
              <a href="/products" className="text-gray-700 hover:text-primary-600 font-medium">
                Products
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
                     {/* Product Images */}
                       <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.image_url ? (
                  <ProductImageSlider imageUrls={product.image_url} productName={product.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-32 h-32 text-gray-400" />
                  </div>
                )}
              </div>
              {!product.image_url && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Product images will be uploaded here
                </p>
              )}
            </div>

          {/* Product Details */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{product.category.name}</p>
              {product.description && (
                <p className="text-gray-700 mb-6">{product.description}</p>
              )}
            </div>

            {/* Product Specifications (read-only badges) */}
            <div className="space-y-4 mb-8">
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Available Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.materials && product.materials.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Available Materials</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.materials.map((material, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dispatch Note */}
            <div className="mb-4 p-3 rounded-md bg-yellow-50 text-yellow-900 border border-yellow-200 text-sm">
              <strong>Note:</strong> We will proceed order dispatch after purchase order only.
            </div>

            {/* Get Quotation Button */}
            <button
              onClick={() => setShowAddToCart(true)}
              className="btn-primary w-full flex items-center justify-center space-x-2 py-4 text-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>

        {/* Add To Cart Modal (minimal fields) */}
        {showAddToCart && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add {product.name} to Cart</h3>
                  <button
                    onClick={() => setShowAddToCart(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleAddToCart} className="space-y-4">
                  {/* Size selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <select className="input-field" value={size} onChange={(e)=>setSize(e.target.value)}>
                        <option value="">Select size</option>
                        {(product.sizes||[]).map((s, i)=> (
                          <option key={i} value={s}>{s}</option>
                        ))}
                        <option value="custom">Custom size</option>
                      </select>
                      {size === 'custom' && (
                        <div className="grid grid-cols-5 gap-2">
                          <input className="input-field col-span-2" placeholder="H" value={customSize.h} onChange={(e)=>setCustomSize({...customSize, h:e.target.value})} />
                          <input className="input-field col-span-2" placeholder="W" value={customSize.w} onChange={(e)=>setCustomSize({...customSize, w:e.target.value})} />
                          <select className="input-field" value={customSize.unit} onChange={(e)=>setCustomSize({...customSize, unit:e.target.value})}>
                            <option value="inch">inch</option>
                            <option value="cm">cm</option>
                            <option value="mm">mm</option>
                            <option value="ft">ft</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Material selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <select className="input-field" value={material} onChange={(e)=>setMaterial(e.target.value)}>
                        <option value="">Select material</option>
                        {(product.materials||[]).map((m, i)=> (
                          <option key={i} value={m}>{m}</option>
                        ))}
                        <option value="custom">Custom material</option>
                      </select>
                      {material === 'custom' && (
                        <input className="input-field" placeholder="Enter custom material" value={customMaterial} onChange={(e)=>setCustomMaterial(e.target.value)} />
                      )}
                    </div>
                  </div>

                                     {/* Quantity */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                     <input
                       type="number"
                       min="1"
                       value={quantity}
                       onChange={(e) => setQuantity(parseInt(e.target.value || '1'))}
                       className="input-field"
                       required
                     />
                   </div>

                   {/* Image Upload */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Upload Reference Images (optional)</label>
                     <ImageUpload onUploadSuccess={handleImageUploadSuccess} />
                     {uploadedImages.length > 0 && (
                       <div className="mt-2">
                         <p className="text-sm text-gray-600 mb-2">Uploaded Images:</p>
                         <div className="flex flex-wrap gap-2">
                           {uploadedImages.map((imageUrl, index) => (
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
                   </div>
                                     <div className="flex space-x-3 pt-4">
                     <button
                       type="button"
                       onClick={handleAddToCart}
                       className="btn-primary flex-1 flex items-center justify-center space-x-2"
                     >
                       <Send className="w-4 h-4" />
                       <span>Add to Cart</span>
                     </button>
                     <button
                       type="button"
                       onClick={() => setShowAddToCart(false)}
                       className="btn-secondary flex-1"
                     >
                       Cancel
                     </button>
                   </div>
                   
                   {/* Alternative: Direct Quotation Button */}
                   <div className="mt-4 pt-4 border-t border-gray-200">
                     <GetQuotationButton product={{
                       name: product.name,
                       category: product.category?.name,
                       size: size === 'custom' ? `${customSize.h}x${customSize.w} ${customSize.unit}`.trim() : size || null,
                       material: material === 'custom' ? customMaterial : material || null,
                       quantity: quantity
                     }} />
                   </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Product Image Slider Component
function ProductImageSlider({ imageUrls, productName }: { imageUrls: string, productName: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Parse image URLs - handle both single URL and JSON array
  let urls: string[] = []
  try {
    if (imageUrls.startsWith('[')) {
      urls = JSON.parse(imageUrls)
    } else {
      urls = [imageUrls]
    }
  } catch {
    urls = [imageUrls]
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % urls.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + urls.length) % urls.length)
  }

  if (urls.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-500 text-sm">No Image</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full group">
      <img
        src={urls[currentImageIndex]}
        alt={`${productName} - Image ${currentImageIndex + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.nextElementSibling?.classList.remove('hidden')
        }}
      />
      <div className="hidden w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-500 text-sm">Image Error</p>
        </div>
      </div>
      
      {/* Navigation arrows - only show if multiple images */}
      {urls.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          {/* Image indicators */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {urls.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
