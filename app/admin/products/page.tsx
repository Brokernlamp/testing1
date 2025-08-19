'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, Plus, Search, Edit, Trash2, Save, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
// import { uploadImageToImageKit, getOptimizedImageUrl } from '@/lib/imagekit'
import toast from 'react-hot-toast'

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
  top_seller: boolean
  created_at: string
  updated_at: string
  category: {
    name: string
  }
}

interface Category {
  id: string
  name: string
  description: string | null
}

interface ProductForm {
  name: string
  description: string
  category_id: string
  sizes: string[]
  materials: string[]
  image_url: string
  top_seller: boolean
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    category_id: '',
    sizes: [''],
    materials: [''],
    image_url: '',
    top_seller: false
  })
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      router.push('/admin')
      return
    }

    fetchProducts()
    fetchCategories()
  }, [router])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const handleInputChange = (field: keyof ProductForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNewImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewImageUrl(e.target.value)
  }

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const handleArrayChange = (field: 'sizes' | 'materials', index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...prev[field]]
      newArray[index] = value
      return { ...prev, [field]: newArray }
    })
  }

  const addArrayItem = (field: 'sizes' | 'materials') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: 'sizes' | 'materials', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.category_id) {
      toast.error('Name and category are required')
      return
    }

    try {
      let finalImageUrl = formData.image_url
      
      // Use the image URLs from the array if provided
      if (imageUrls.length > 0) {
        finalImageUrl = JSON.stringify(imageUrls)
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category_id: formData.category_id,
        sizes: formData.sizes.filter(s => s.trim()),
        materials: formData.materials.filter(m => m.trim()),
        image_url: finalImageUrl,
        top_seller: formData.top_seller,
        is_active: true
      }

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
        toast.success('Product updated successfully')
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert(productData)

        if (error) throw error
        toast.success('Product created successfully')
      }

      setShowAddForm(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        category_id: '',
        sizes: [''],
        materials: [''],
        image_url: '',
        top_seller: false
      })
      setImageUrls([])
      setNewImageUrl('')
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Failed to save product')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      category_id: product.category_id,
      sizes: product.sizes && product.sizes.length > 0 ? product.sizes : [''],
      materials: product.materials && product.materials.length > 0 ? product.materials : [''],
      image_url: product.image_url || '',
      top_seller: product.top_seller || false
    })
    setShowAddForm(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const handleToggleActive = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id)

      if (error) throw error
      toast.success(`Product ${product.is_active ? 'deactivated' : 'activated'} successfully`)
      fetchProducts()
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    }
  }

  const resetForm = () => {
    setShowAddForm(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      category_id: '',
      sizes: [''],
      materials: [''],
      image_url: '',
      top_seller: false
    })
    setImageUrls([])
    setNewImageUrl('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
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
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SKS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                <p className="text-sm text-gray-600">Create and manage products</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/admin/dashboard" className="text-gray-700 hover:text-primary-600 font-medium">
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <a href="/admin/dashboard" className="text-gray-500 hover:text-primary-600 font-medium">
              Dashboard
            </a>
            <a href="/admin/products" className="text-primary-600 border-b-2 border-primary-600 pb-2 font-medium">
              Products
            </a>
            <a href="/admin/enquiries" className="text-gray-500 hover:text-primary-600 font-medium">
              Enquiries
            </a>
            <a href="/admin/inventory" className="text-gray-500 hover:text-primary-600 font-medium">
              Inventory
            </a>
            <a href="/admin/templates" className="text-gray-500 hover:text-primary-600 font-medium">
              Templates
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <p className="text-gray-600 mt-1">Manage your product catalog</p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Add/Edit Product Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input-field"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Enter product description"
                />
              </div>

                             {/* Product Images */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Product Images (Multiple URLs)
                 </label>
                 <div className="space-y-3">
                   {/* Current Images Display */}
                   {imageUrls.length > 0 && (
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                       {imageUrls.map((url, index) => (
                         <div key={index} className="relative">
                           <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                             <img
                               src={url}
                               alt={`Product ${index + 1}`}
                               className="w-full h-full object-cover"
                               onError={(e) => {
                                 e.currentTarget.style.display = 'none'
                                 e.currentTarget.nextElementSibling?.classList.remove('hidden')
                               }}
                             />
                             <div className="hidden w-full h-full flex items-center justify-center">
                               <ImageIcon className="w-8 h-8 text-gray-400" />
                             </div>
                           </div>
                           <button
                             type="button"
                             onClick={() => removeImageUrl(index)}
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                           >
                             ×
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                   
                   {/* Add New URL */}
                   <div className="flex space-x-2">
                     <input
                       type="url"
                       value={newImageUrl}
                       onChange={handleNewImageUrlChange}
                       className="input-field flex-1"
                       placeholder="Paste ImageKit URL here"
                     />
                     <button
                       type="button"
                       onClick={addImageUrl}
                       className="btn-primary px-4 py-2"
                     >
                       Add
                     </button>
                   </div>
                   <p className="text-xs text-gray-500">
                     Upload images to ImageKit and paste URLs here. Multiple images will create a slideshow.
                   </p>
                 </div>
               </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Sizes
                </label>
                <div className="space-y-2">
                  {formData.sizes.map((size, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={size}
                        onChange={(e) => handleArrayChange('sizes', index, e.target.value)}
                        className="input-field flex-1"
                        placeholder="Enter size (e.g., A4, Custom)"
                      />
                      {formData.sizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('sizes', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('sizes')}
                    className="text-primary-600 hover:text-primary-800 text-sm"
                  >
                    + Add Size
                  </button>
                </div>
              </div>

              {/* Materials */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Materials
                </label>
                <div className="space-y-2">
                  {formData.materials.map((material, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={material}
                        onChange={(e) => handleArrayChange('materials', index, e.target.value)}
                        className="input-field flex-1"
                        placeholder="Enter material (e.g., Vinyl, Canvas)"
                      />
                      {formData.materials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('materials', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('materials')}
                    className="text-primary-600 hover:text-primary-800 text-sm"
                  >
                    + Add Material
                  </button>
                </div>
                             </div>

               {/* Top Seller Toggle */}
               <div className="flex items-center space-x-3">
                 <input
                   type="checkbox"
                   id="top_seller"
                   checked={formData.top_seller}
                   onChange={(e) => handleInputChange('top_seller', e.target.checked)}
                   className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                 />
                 <label htmlFor="top_seller" className="text-sm font-medium text-gray-700">
                   Mark as Top Seller (will appear on homepage)
                 </label>
               </div>
               
               <div className="flex space-x-3">
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                                 {product.image_url ? (
                                       <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                 ) : null}
                <div className={`w-full h-full flex items-center justify-center ${product.image_url ? 'hidden' : ''}`}>
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category.name}</p>
                {product.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                )}
                <p className="text-xs text-gray-400">
                  Updated: {formatDate(product.updated_at)}
                </p>
              </div>

                             <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                 <div className="flex items-center space-x-2">
                   <button
                     onClick={() => handleToggleActive(product)}
                     className={`px-2 py-1 text-xs rounded-full ${
                       product.is_active
                         ? 'bg-green-100 text-green-800'
                         : 'bg-gray-100 text-gray-800'
                     }`}
                   >
                     {product.is_active ? 'Active' : 'Inactive'}
                   </button>
                   {product.top_seller && (
                     <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                       Top Seller
                     </span>
                   )}
                 </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No products found</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary mt-4"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
