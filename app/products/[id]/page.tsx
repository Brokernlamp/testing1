'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingCart, Calendar, Package, MessageSquare, Send, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
// import { getOptimizedImageUrl } from '@/lib/imagekit'
import toast from 'react-hot-toast'
import { addItem } from '@/components/cart/CartProvider'

interface Product {
  id: string
  name: string
  description: string | null
  category_id: string
  images: string[] | null
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

interface QuotationForm {
  department: string
  contact_phone: string
  size: string
  custom_size_height: string
  custom_size_width: string
  quantity: number
  material: string
  custom_material: string
  delivery_date: string
  comments: string
  files?: File[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQuotationForm, setShowQuotationForm] = useState(false)
  const [formData, setFormData] = useState<QuotationForm>({
    department: '',
    contact_phone: '',
    size: '',
    custom_size_height: '',
    custom_size_width: '',
    quantity: 1,
    material: '',
    custom_material: '',
    delivery_date: '',
    comments: ''
  })
  const [uploadFiles, setUploadFiles] = useState<File[]>([])

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

  const handleInputChange = (field: keyof QuotationForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault()

    if (!product) return
    const finalSize = formData.size || `${formData.custom_size_height}*${formData.custom_size_width}`
    const finalMaterial = formData.material || formData.custom_material

    addItem({
      id: product.id + ':' + Date.now(),
      type: 'product',
      name: product.name,
      category: product.category?.name || null,
      size: finalSize || null,
      quantity: formData.quantity,
      material: finalMaterial || null,
      delivery_date: formData.delivery_date || null,
      comments: formData.comments || null,
      images: uploadFiles,
    })
    toast.success('Added to cart')
    setShowQuotationForm(false)
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
                <p className="text-sm text-gray-600">Get quotation for this product</p>
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

            {/* Product Specifications */}
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
              onClick={() => setShowQuotationForm(true)}
              className="btn-primary w-full flex items-center justify-center space-x-2 py-4 text-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Get Quotation</span>
            </button>
          </div>
        </div>

        {/* Quotation Form Modal */}
        {showQuotationForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Request Quotation for {product.name}
                  </h3>
                  <button
                    onClick={() => setShowQuotationForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleAddToCart} className="space-y-4">
                  {/* Upload reference images (optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Reference Photos (optional)</label>
                    <input type="file" multiple accept="image/*" onChange={(e)=> setUploadFiles(Array.from(e.target.files || []))} />
                    {uploadFiles.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{uploadFiles.length} file(s) selected. They will be sent as attachments.</p>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department *
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="input-field"
                        placeholder="Department / Team"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                        className="input-field"
                        placeholder="e.g. +91 98xxxxxxxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Size Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size *
                    </label>
                    <div className="space-y-3">
                      {product.sizes && product.sizes.length > 0 && (
                        <div>
                          <label className="text-sm text-gray-600">Select from available sizes:</label>
                          <select
                            value={formData.size}
                            onChange={(e) => handleInputChange('size', e.target.value)}
                            className="input-field mt-1"
                          >
                            <option value="">Choose a size</option>
                            {product.sizes.map((size, index) => (
                              <option key={index} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <div>
                        <label className="text-sm text-gray-600">Or enter custom dimensions:</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <input
                            type="text"
                            value={formData.custom_size_height}
                            onChange={(e) => handleInputChange('custom_size_height', e.target.value)}
                            className="input-field"
                            placeholder="Height"
                          />
                          <input
                            type="text"
                            value={formData.custom_size_width}
                            onChange={(e) => handleInputChange('custom_size_width', e.target.value)}
                            className="input-field"
                            placeholder="Width"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <select className="input-field" onChange={(e)=>handleInputChange('size', `${formData.custom_size_height}*${formData.custom_size_width} ${e.target.value}`)}>
                            <option value="">Select unit</option>
                            <option value="inch">inch</option>
                            <option value="cm">cm</option>
                            <option value="mm">mm</option>
                            <option value="ft">ft</option>
                          </select>
                          <button type="button" className="btn-secondary" onClick={()=>handleInputChange('size', '34*23 inch')}>Example 34*23 inch</button>
                          <div></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Material Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material *
                    </label>
                    <div className="space-y-3">
                      {product.materials && product.materials.length > 0 && (
                        <div>
                          <label className="text-sm text-gray-600">Select from available materials:</label>
                          <select
                            value={formData.material}
                            onChange={(e) => handleInputChange('material', e.target.value)}
                            className="input-field mt-1"
                          >
                            <option value="">Choose a material</option>
                            {product.materials.map((material, index) => (
                              <option key={index} value={material}>
                                {material}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <div>
                        <label className="text-sm text-gray-600">Or enter custom material:</label>
                        <input
                          type="text"
                          value={formData.custom_material}
                          onChange={(e) => handleInputChange('custom_material', e.target.value)}
                          className="input-field"
                          placeholder="Enter custom material"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Date *
                    </label>
                    <input
                      type="date"
                      value={formData.delivery_date}
                      onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                      className="input-field"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <p className="text-xs text-yellow-700 mt-2">We will proceed order dispatch after purchase order only.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Comments
                    </label>
                    <textarea
                      value={formData.comments}
                      onChange={(e) => handleInputChange('comments', e.target.value)}
                      className="input-field"
                      rows={3}
                      placeholder="Any special requirements or additional information..."
                    />
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
                      onClick={() => setShowQuotationForm(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
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
