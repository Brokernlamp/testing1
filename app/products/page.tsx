'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Filter, ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight, Layers, Palette, Ruler, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import CartButton from '@/components/CartButton'
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

  const tileThemes = [
    { gradient: 'from-blue-50 via-white to-blue-100', accent: 'text-blue-600', glow: 'bg-blue-200', icon: Layers },
    { gradient: 'from-rose-50 via-white to-rose-100', accent: 'text-rose-600', glow: 'bg-rose-200', icon: Palette },
    { gradient: 'from-emerald-50 via-white to-emerald-100', accent: 'text-emerald-600', glow: 'bg-emerald-200', icon: Ruler },
    { gradient: 'from-amber-50 via-white to-amber-100', accent: 'text-amber-600', glow: 'bg-amber-200', icon: Sparkles }
  ]

  const categoryStats = useMemo(() => {
    const counts = products.reduce<Record<string, number>>((acc, product) => {
      const name = product.category?.name
      if (!name) return acc
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {})

    return categories.map((category) => ({
      ...category,
      count: counts[category.name] || 0,
    }))
  }, [products, categories])

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
      setCategories((data || []).filter(c => (c.name || '').toLowerCase() !== 'custom order'))
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F8FFFE 0%, #E8F5E8 50%, #E3F2FD 100%)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Products</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className="px-2 py-1 text-xs sm:text-sm text-gray-700 hover:text-gray-900 rounded transition-colors">Home</Link>
            <Link href="/custom-order" className="px-2 py-1 text-xs sm:text-sm text-gray-700 hover:text-gray-900 rounded transition-colors">Custom Order</Link>
            <div className="scale-90 sm:scale-100 origin-right">
              <CartButton />
            </div>
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
                  className="input-field md:w-48 min-h-[44px]"
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

      {categoryStats.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-primary-600 font-semibold">Product Categories</p>
                <h2 className="text-2xl font-bold text-gray-900">Browse by tiles</h2>
              </div>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="text-sm text-primary-600 hover:text-primary-800 font-semibold"
                >
                  Clear selection
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categoryStats.map((category, index) => {
                const isActive = selectedCategory === category.name
                const theme = tileThemes[index % tileThemes.length]
                const Icon = theme.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(isActive ? '' : category.name)}
                    aria-pressed={isActive}
                    className={`relative overflow-hidden text-left p-5 rounded-3xl border transition-all duration-300 bg-gradient-to-br ${theme.gradient} ${
                      isActive
                        ? 'border-transparent ring-2 ring-offset-2 ring-primary-500 shadow-xl'
                        : 'border-transparent hover:border-primary-200 hover:-translate-y-1 shadow'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Category</div>
                        <div className="text-lg font-semibold text-gray-900">{category.name}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/80 shadow-inner">
                        <Icon className={`w-5 h-5 ${theme.accent}`} />
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-3">{category.description}</p>
                    )}
                    <div className="mt-6 flex items-center justify-between text-sm font-semibold text-gray-700">
                      <span>{category.count} product{category.count === 1 ? '' : 's'}</span>
                      <span className={`flex items-center gap-1 ${theme.accent}`}>
                        {isActive ? 'Selected' : 'View'}
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                    <span
                      className={`absolute inset-x-4 -bottom-4 h-10 blur-3xl opacity-40 ${theme.glow}`}
                      aria-hidden="true"
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      )}

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
              
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 group-hover:scale-[1.01]">
                      <div className="aspect-[3/4] sm:aspect-[1/1] bg-gray-200 rounded-t-lg overflow-hidden">
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
                      
                      <div className="p-3 sm:p-3">
                        <div className="mb-2">
                          <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                            {product.category.name}
                          </span>
                        </div>
                        
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[2.5rem]">
                          {product.name}
                        </h3>
                        
                        {product.description && (
                          <p className="text-gray-600 text-xs sm:text-xs mb-2 sm:mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {product.sizes && product.sizes.length > 0 && (
                              <span className="block">Sizes: {product.sizes.slice(0, 2).join(', ')}</span>
                            )}
                            {product.materials && product.materials.length > 0 && (
                              <span className="block">Materials: {product.materials.slice(0, 2).join(', ')}</span>
                            )}
                          </div>
                          
                          <Link
                            href={`/products/${product.id}`}
                            className="btn-primary text-xs sm:text-xs px-3 py-2"
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
                <li>🪧 Signage Boards</li>
                <li>🖌️ Letter Painting</li>
                <li>🖨️ Screen Printing</li>
                <li>🪚 Laser Cutting</li>
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
              <p className="text-gray-400 mb-2">
                <a href="tel:+918380848305" className="hover:text-white transition-colors">
                  +91 83808 48305
                </a>
              </p>
              <p className="text-gray-400 mb-2">
                <a href="mailto:shreekrishnasigns@gmail.com" className="hover:text-white transition-colors">
                  shreekrishnasigns@gmail.com
                </a>
              </p>
              <p className="text-gray-400">Daund Patas Road, Pune, Maharashtra</p>
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
        className="w-full h-full object-contain bg-white"
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
