'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Filter, ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
// import { getOptimizedImageUrl } from '@/lib/imagekit'

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

interface Category {
  id: string
  name: string
  description: string | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchQuery, selectedCategory, products])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
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
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category.name === selectedCategory)
    }

    setFilteredProducts(filtered)
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <div className="flex items-center gap-3">
            <Link href="/custom-order" className="btn-secondary">Custom Order</Link>
            <Link href="/cart" className="btn-primary">Cart</Link>
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field md:w-48"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedCategory 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No products available at the moment'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedCategory ? selectedCategory : 'All Products'}
                </h2>
                <p className="text-gray-600">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 group-hover:scale-105">
                                             <div className="aspect-square bg-gray-200 rounded-t-xl overflow-hidden mb-4">
                         {product.image_url ? (
                           <ProductImageSlider imageUrls={product.image_url} productName={product.name} />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center">
                             <div className="text-center p-4">
                               <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                 <ShoppingCart className="w-8 h-8 text-gray-500" />
                               </div>
                               <p className="text-gray-500 text-sm">Image</p>
                             </div>
                           </div>
                         )}
                       </div>
                      
                      <div className="p-4">
                        <div className="mb-2">
                          <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                            {product.category.name}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {product.name}
                        </h3>
                        
                        {product.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            {product.sizes && product.sizes.length > 0 && (
                              <span className="block">Sizes: {product.sizes.slice(0, 2).join(', ')}</span>
                            )}
                            {product.materials && product.materials.length > 0 && (
                              <span className="block">Materials: {product.materials.slice(0, 2).join(', ')}</span>
                            )}
                          </div>
                          
                          <Link
                            href={`/products/${product.id}`}
                            className="btn-primary text-sm px-4 py-2"
                          >
                            Get Quote
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Can't find exactly what you're looking for? We specialize in custom signage solutions.
          </p>
          <Link href="/contact" className="btn-secondary text-lg px-8 py-3">
            Contact Us for Custom Quote
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Shree Krishna Signs</h3>
              <p className="text-gray-400">
                High-quality signage and printing solutions since 1991
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Signage Boards</li>
                <li>Letter Painting</li>
                <li>Screen Printing</li>
                <li>Laser Cutting</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <p className="text-gray-400 mb-2">+91 98765 43210</p>
              <p className="text-gray-400 mb-2">info@shreekrishnasigns.com</p>
              <p className="text-gray-400">Mumbai, Maharashtra, India</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Shree Krishna Signs. All rights reserved.</p>
          </div>
        </div>
      </footer>
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
            <ShoppingCart className="w-8 h-8 text-gray-500" />
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
            <ShoppingCart className="w-8 h-8 text-gray-500" />
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
