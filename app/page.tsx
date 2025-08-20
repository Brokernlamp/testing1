'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Phone, Mail, MapPin, ChevronLeft, ChevronRight, Menu, X, Play, Award, Users, Calendar, Facebook, Instagram, Linkedin } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [topSellerProducts, setTopSellerProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const heroImages = ['/4.jpg', '/3.jpg', '/5.jpg', '/1.jpg', '/2.png']
  const [heroIndex, setHeroIndex] = useState(0)

  const categories = [
    'Signage Boards',
    'Letter Painting',
    'Screen Printing',
    'Engraving & Etching',
    'Laser Cutting',
    'Eco-Solvent & UV Printing',
    'Safety Posters & Industrial Labels'
  ]

  // Fetch top seller products
  useEffect(() => {
    const fetchTopSellerProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name)
          `)
          .eq('is_active', true)
          .eq('top_seller', true)
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) throw error
        setTopSellerProducts(data || [])
      } catch (error) {
        console.error('Error fetching top seller products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopSellerProducts()
  }, [])

  // Enable hero stats animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // Auto-slide hero images
  useEffect(() => {
    if (heroImages.length <= 1) return
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Client logos - place files in public/clients/
  const clientLogos = [
    { name: 'Client 1', src: '/clients/logo1.png' },
    { name: 'Client 2', src: '/clients/logo2.png' },
    { name: 'Client 3', src: '/clients/logo3.png' },
    { name: 'Client 4', src: '/clients/logo4.png' },
    { name: 'Client 6', src: '/clients/logo6.png' },
    { name: 'Client 7', src: '/clients/logo7.png' },
    { name: 'Client 8', src: '/clients/logo8.png' },
    { name: 'Client 9', src: '/clients/logo9.png' },
    
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header
        className="bg-white shadow-sm h-16 md:h-20 px-6 sticky top-0 z-50"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-full">
          {/* Logo block */}
          <div className="flex items-center space-x-4">
            <img src="/logo.png" alt="SKS Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
            <div className="flex flex-col">
              <span className="text-[#1E88E5] font-semibold text-lg md:text-xl">Shree Krishna Signs</span>
              <span className="text-[#7BC142] text-xs md:text-sm font-medium">Since 1991</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#services" className="text-gray-700 hover:text-[#1E88E5] transition-colors duration-150 font-medium text-base px-2 py-1">
              Services
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-[#1E88E5] transition-colors duration-150 font-medium text-base px-2 py-1">
              Products
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-[#1E88E5] transition-colors duration-150 font-medium text-base px-2 py-1">
              About Us
            </Link>
            <Link href="#clients" className="text-gray-700 hover:text-[#1E88E5] transition-colors duration-150 font-medium text-base px-2 py-1">
              Clients
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-[#1E88E5] transition-colors duration-150 font-medium text-base px-2 py-1">
              Contact
            </Link>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/products" className="px-6 py-3 rounded-xl border border-[#5BB5D1] text-[#1E88E5] font-semibold text-sm hover:bg-[#5BB5D1] hover:text-white transition-all duration-150">
              Get Quote
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-colors duration-150"
              style={{ background: 'linear-gradient(135deg, #5BB5D1 0%, #7BC142 100%)' }}
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:ring-offset-2 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
            {/* Mobile Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[#5BB5D1] to-[#7BC142] flex items-center justify-center text-white font-bold text-sm">SKS</div>
                <span className="text-[#1E88E5] font-semibold text-lg">SKS</span>
              </div>
              <button
                className="p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:ring-offset-2 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close mobile menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-6 py-6 space-y-4">
              {[
                { name: 'Services', href: '#services' },
                { name: 'Products', href: '/products' },
                { name: 'About Us', href: '#about' },
                { name: 'Clients', href: '#clients' },
                { name: 'Contact', href: '#contact' },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-3 text-gray-700 hover:text-[#1E88E5] transition-colors duration-150 font-medium text-lg border-b border-gray-100 last:border-b-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Action Buttons */}
            <div className="px-6 py-6 space-y-3 border-t border-gray-200">
              <Link
                href="/products"
                className="w-full block text-center px-6 py-3 rounded-xl border border-[#5BB5D1] text-[#1E88E5] font-semibold text-sm hover:bg-[#5BB5D1] hover:text-white transition-all duration-150"
              >
                Get Quote
              </Link>
              <Link
                href="/contact"
                className="w-full block text-center px-6 py-3 rounded-xl text-white font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #5BB5D1 0%, #7BC142 100%)' }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section (Create.xyz style) */}
      <section
        className="relative py-20 md:py-32 px-6 min-h-[70vh] flex items-center"
        style={{
          background: 'linear-gradient(135deg, #E3F2FD 0%, #E8F5E8 50%, #F0F8F7 100%)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#5BB5D1]/20 mb-6">
                <Award size={16} className="text-[#1E88E5]" />
                <span className="text-[#1E88E5] font-semibold text-sm">Trusted Since 1991</span>
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl leading-tight text-gray-900 mb-6 max-w-3xl"
                style={{ fontFamily: 'Playfair Display, serif', fontWeight: '700', letterSpacing: '-0.02em' }}
              >
                Premium <span className="text-[#1E88E5]">Signage</span>
                <br />
                <span className="text-[#7BC142]">Printing Solutions</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-[55ch] mx-auto lg:mx-0 leading-relaxed">
                Over three decades of expertise in creating durable, customized, and impactful signages for businesses across all industries.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 mb-12">
                <Link
                  href="/products"
                  className="px-8 py-4 rounded-xl text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-150 focus:outline-none"
                  style={{ background: 'linear-gradient(135deg, #5BB5D1 0%, #7BC142 100%)' }}
                >
                  Get Free Quote
                </Link>
                <Link href="#clients" className="group flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl hover:bg-white transition-all duration-150">
                  <div className="flex items-center justify-center w-8 h-8 border border-[#1E88E5]/20 rounded-full">
                    <Play size={12} className="text-[#1E88E5] ml-[1px]" />
                  </div>
                  <span className="text-gray-700 font-semibold text-base">View Our Work</span>
                </Link>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { icon: Calendar, value: '33+', label: 'Years Experience' },
                  { icon: Users, value: '1000+', label: 'Happy Clients' },
                  { icon: Award, value: '50+', label: 'Industries Served' },
                ].map((stat, index) => {
                  const IconComponent = stat.icon
                  return (
                    <div
                      key={stat.label}
                      className={`text-center transition-all duration-300 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <div className="flex justify-center mb-2">
                        <div className="p-2 bg-white/60 rounded-lg">
                          <IconComponent size={20} className="text-[#1E88E5]" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Column - Visual Content */}
            <div className="relative">
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white p-4">
                  <img
                    src={heroImages[heroIndex]}
                    alt={`Showcase ${heroIndex + 1}`}
                    className="w-full h-[400px] object-cover rounded-2xl transition-opacity duration-500"
                  />
                </div>
                <div className={`absolute -top-4 -right-4 transition-all duration-300 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '200ms' }}>
                  <div className="px-4 py-3 rounded-2xl text-white font-semibold text-sm shadow-lg" style={{ background: 'linear-gradient(135deg, #1E88E5 0%, #5BB5D1 100%)' }}>
                    ✨ Premium Quality
                  </div>
                </div>
                <div className={`absolute -bottom-4 -left-4 transition-all duration-300 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '300ms' }}>
                  <div className="px-4 py-3 rounded-2xl text-white font-semibold text-sm shadow-lg" style={{ background: 'linear-gradient(135deg, #7BC142 0%, #5BB5D1 100%)' }}>
                    🏆 Since 1991
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Seller Products Section (moved up to be visible instantly) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Top Seller Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our most popular and highly-rated signage solutions
            </p>
          </motion.div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading top sellers...</p>
            </div>
          ) : topSellerProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topSellerProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
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
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
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
                        <Link href={`/products/${product.id}`} className="btn-primary text-sm px-4 py-2">
                          Get Quote
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No top seller products yet</h3>
              <p className="text-gray-600">Mark products as top sellers in the admin panel to display them here</p>
            </div>
          )}
        </div>
      </section>

      {/* About Us Section (Create.xyz style) */}
      <section id="about" className="py-20 md:py-24 px-6 bg-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E3F2FD] rounded-full mb-6">
              <span className="text-[#1E88E5] font-semibold text-sm">About Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl leading-tight text-gray-900 mb-6" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '700' }}>
              Trusted <span className="text-[#1E88E5]">Signage Partner</span>
              <br />
              <span className="text-[#7BC142]">Since 1991</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Since 1991, <span className="font-semibold">Shree Krishna Signs</span> has been a trusted name in delivering high-quality signage and printing solutions. With over three decades of experience, we specialize in creating durable, customized, and impactful signages that help businesses elevate their brand presence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <p className="text-base text-gray-700 leading-relaxed">
                Our team, backed by advanced machinery like <span className="font-semibold">Eco-Solvent and UV Printers</span>, <span className="font-semibold">Metal Photo Label machines</span>, <span className="font-semibold">Laser Cutters</span>, and <span className="font-semibold">Engraving tools</span>, ensures <span className="font-semibold">precision, durability, and innovative solutions</span> for a wide range of industries.
              </p>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Industries We Serve</h3>
                <div className="flex flex-wrap gap-3">
                  {['Manufacturing', 'Healthcare', 'Hospitality', 'Corporate'].map((name) => (
                    <div key={name} className="flex items-center gap-2 px-4 py-2 bg-[#F0F8F7] rounded-full border border-[#7BC142]/20">
                      <span className="w-2 h-2 bg-[#7BC142] rounded-full" />
                      <span className="text-sm font-medium text-gray-700">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-xl bg-white p-4">
                <img
                  src="/6.png"
                  alt="Advanced printing and signage machinery"
                  className="w-full h-[300px] object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>

          <div id="services" className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '700' }}>
                Our <span className="text-[#7BC142]">Services</span>
              </h3>
              <p className="text-lg text-gray-600">We provide a complete range of signage and print solutions tailored to your needs</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((service) => (
                <div key={service} className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#5BB5D1]/30 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#5BB5D1]/10 to-[#7BC142]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="w-2 h-2 bg-[#1E88E5] rounded-full" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{service}</h4>
                  <p className="text-gray-600 leading-relaxed">Premium quality and durable results.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Removed duplicate Top Seller section (now shown above) */}

      {/* Clients Section (Create.xyz style, floating logos) */}
      <section
        id="clients"
        className="relative py-20 md:py-24 px-6 min-h-[25vh] overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #F8FFFE 0%, #E8F5E8 50%, #E3F2FD 100%)', fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 bg-[#1E88E5] rounded-full"></div>
          <div className="absolute top-32 right-16 w-12 h-12 bg-[#7BC142] rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-[#5BB5D1] rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-8 h-8 bg-[#1E88E5] rounded-full"></div>
        </div>
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#5BB5D1]/20 mb-6">
              <span className="text-[#1E88E5] font-semibold text-sm">Our Clients</span>
            </div>
            <h2 className="text-3xl md:text-4xl leading-tight text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '700' }}>
              Trusted by <span className="text-[#7BC142]">Industry Leaders</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Over 1000+ businesses across various industries trust us for their signage and printing needs</p>
          </div>

          <div className="relative h-[400px] md:h-[500px]">
            {clientLogos.map((client, index) => {
              const total = Math.max(clientLogos.length, 1)
              const angle = (index / total) * Math.PI * 2
              const centerX = 50
              const centerY = 50
              // Expand orbit slightly as count grows to reduce overlap
              const radiusX = Math.min(50, 30 + total * 1.6)
              const radiusY = Math.min(36, 20 + total * 1.2)
              const top = `${centerY + radiusY * Math.sin(angle)}%`
              const left = `${centerX + radiusX * Math.cos(angle)}%`
              const delay = index * 150
              // Dynamic size: fewer logos -> larger, more logos -> smaller
              const size = Math.max(72, Math.min(120, 130 - total * 4))
              const imgSize = Math.round(size * 0.8)
              return (
                <div
                  key={client.name}
                  className={`absolute transition-all duration-500 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ top, left, transitionDelay: `${delay}ms`, animation: `float-${index % 3} 6s ease-in-out infinite` }}
                >
                  <div className="group relative">
                    <div
                      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 flex items-center justify-center overflow-hidden"
                      style={{ width: size, height: size }}
                    >
                      <img
                        src={client.src}
                        alt={`${client.name} logo`}
                        className="object-contain"
                        style={{ width: imgSize, height: imgSize, imageRendering: 'auto' }}
                        loading="eager"
                        decoding="sync"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <style jsx global>{`
          @keyframes float-0 {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-10px) translateX(5px); }
            50% { transform: translateY(-5px) translateX(-5px); }
            75% { transform: translateY(-15px) translateX(3px); }
          }
          @keyframes float-1 {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-8px) translateX(-4px); }
            50% { transform: translateY(-12px) translateX(6px); }
            75% { transform: translateY(-6px) translateX(-3px); }
          }
          @keyframes float-2 {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-12px) translateX(4px); }
            50% { transform: translateY(-8px) translateX(-6px); }
            75% { transform: translateY(-10px) translateX(5px); }
          }
        `}</style>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-gray-900 text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-6" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '700' }}>Ready to Get Started?</h2>
            <p className="text-lg text-gray-300">Contact us today for a free consultation and quote</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Phone className="w-12 h-12 mx-auto mb-4 text-[#5BB5D1]" />
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-300">+91 9689941047</p>
            </div>
            <div className="text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-[#1E88E5]" />
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-300">shreekrishnasigns@gmail.com</p>
            </div>
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-[#7BC142]" />
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-300">Daund, Dist- Pune, Maharashtra, India</p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="px-8 py-3 rounded-xl text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-150"
              style={{ background: 'linear-gradient(135deg, #5BB5D1 0%, #7BC142 100%)' }}
            >
              Get Free Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Footer (Create.xyz style) */}
      <footer className="bg-gray-900 text-white py-16 px-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 rounded-md bg-gradient-to-br from-[#5BB5D1] to-[#7BC142] flex items-center justify-center text-white font-bold">SKS</div>
                <div>
                  <div className="text-white font-semibold text-lg">Shree Krishna Signs</div>
                  <div className="text-[#7BC142] text-sm">Since 1991</div>
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">Over three decades of excellence in delivering premium signage and printing solutions for businesses across all industries.</p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1E88E5] transition-colors duration-200" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#5BB5D1] transition-colors duration-200" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#7BC142] transition-colors duration-200" aria-label="LinkedIn">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Our Services</h3>
              <ul className="space-y-3">
                {categories.slice(0, 6).map((service) => (
                  <li key={service} className="text-gray-300">{service}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link href="#about" className="text-gray-300 hover:text-[#5BB5D1] transition-colors duration-200">About Us</Link></li>
                <li><Link href="#services" className="text-gray-300 hover:text-[#5BB5D1] transition-colors duration-200">Services</Link></li>
                <li><Link href="/products" className="text-gray-300 hover:text-[#5BB5D1] transition-colors duration-200">Products</Link></li>
                <li><Link href="#clients" className="text-gray-300 hover:text-[#5BB5D1] transition-colors duration-200">Clients</Link></li>
                <li><Link href="#contact" className="text-gray-300 hover:text-[#5BB5D1] transition-colors duration-200">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
              <div className="space-y-4">
                <div className="text-gray-300 text-sm">Your Business Address<br />City, State, PIN Code</div>
                <div className="text-gray-300 text-sm">+91 98765 43210</div>
                <div className="text-gray-300 text-sm">shreekrishnasigns@gmail.com</div>
                <div className="text-gray-300 text-sm">Mon - Sat: 9:00 AM - 7:00 PM</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">© 2024 Shree Krishna Signs. All rights reserved.</div>
              <div className="flex items-center space-x-6">
                <a href="#privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Privacy Policy</a>
                <span className="text-gray-600">|</span>
                <a href="#terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Product Image Slider Component
function ProductImageSlider({ imageUrls, productName }: { imageUrls: string, productName: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  
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

  // Auto-play to the first image, then continue cycling every 3s
  useEffect(() => {
    if (urls.length <= 1) return
    if (isHovered) return
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % urls.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [urls.length, isHovered])

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
    <div className="relative w-full h-full group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
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
