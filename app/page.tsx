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
    'Safety Posters & Industrial Labels',
    'Night Glow Painting',
    'Lamination'
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
    <div className="min-h-screen relative overflow-x-hidden" 
         style={{
           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
           fontFamily: 'Inter, system-ui, sans-serif'
         }}>
      
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;700&display=swap"
        rel="stylesheet"
      />

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-400/30 to-purple-600/20 rounded-full blur-xl"></div>
      <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-cyan-500/30 rounded-full blur-2xl"></div>
      <div className="absolute bottom-40 left-20 w-40 h-40 bg-gradient-to-br from-yellow-400/25 to-orange-500/20 rounded-full blur-xl"></div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-md bg-white/10 border-b border-white/20 h-20 px-6 sticky top-0">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img src="logo.png" alt="SKS Logo" className="h-12 w-12 object-contain rounded-full border-2 border-white/30" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl tracking-tight">Shree Krishna Signs</span>
              <span className="text-pink-200 text-sm font-medium">Since 1991 ✨</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {[
              { name: 'Services', href: '#services' },
              { name: 'Products', href: '/products' },
              { name: 'About Us', href: '#about' },
              { name: 'Clients', href: '#clients' },
              { name: 'Contact', href: '#contact' }
            ].map((item) => (
              <Link key={item.name} href={item.href} className="text-white/90 hover:text-white transition-all duration-300 font-semibold text-base relative group px-3 py-2">
                {item.name}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-violet-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/products" className="px-6 py-3 rounded-2xl border-2 border-white/30 text-white font-semibold text-sm hover:bg-white/20 hover:border-white/50 transition-all duration-300 backdrop-blur-sm">
              Get Quote
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-2xl text-white font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
              style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)' }}
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white/90 hover:text-white focus:outline-none transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 right-0 backdrop-blur-md bg-white/10 border-b border-white/20"
          >
            <nav className="px-6 py-6 space-y-4">
              {[
                { name: 'Services', href: '#services' },
                { name: 'Products', href: '/products' },
                { name: 'About Us', href: '#about' },
                { name: 'Clients', href: '#clients' },
                { name: 'Contact', href: '#contact' }
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-3 text-white/90 hover:text-white transition-colors font-semibold text-lg border-b border-white/10 last:border-b-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 px-6 min-h-[85vh] flex items-center">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center xl:text-left"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/15 backdrop-blur-md rounded-full border border-white/25 mb-8">
                <Award size={20} className="text-yellow-300" />
                <span className="text-white font-bold text-sm">Trusted Since 1991</span>
              </div>

              <h1 className="text-5xl md:text-6xl xl:text-7xl leading-tight text-white mb-8 font-extrabold tracking-tight">
                Premium{' '}
                <span className="bg-gradient-to-r from-pink-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Signage
                </span>
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                  Solutions
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto xl:mx-0">
                Over three decades of expertise in creating{' '}
                <span className="font-semibold text-white">durable, customized, and impactful</span>{' '}
                signages for businesses across all industries.
              </p>

              <div className="flex flex-col sm:flex-row justify-center xl:justify-start items-center gap-6 mb-16">
                <Link
                  href="/products"
                  className="px-10 py-5 rounded-2xl text-white font-bold text-lg shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)' }}
                >
                  Get Free Quote ✨
                </Link>
                <Link href="#clients" className="group flex items-center gap-4 px-8 py-5 bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl hover:bg-white/25 transition-all duration-300">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full group-hover:bg-white/30 transition-all">
                    <Play size={16} className="text-white ml-1" />
                  </div>
                  <span className="text-white font-bold text-lg">View Our Work</span>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8">
                {[
                  { icon: Calendar, value: '33+', label: 'Years Experience' },
                  { icon: Users, value: '1000+', label: 'Happy Clients' },
                  { icon: Award, value: '50+', label: 'Industries Served' },
                ].map((stat, index) => {
                  const IconComponent = stat.icon
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={statsVisible ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      className="text-center"
                    >
                      <div className="flex justify-center mb-3">
                        <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/25">
                          <IconComponent size={24} className="text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                      <div className="text-white/70 font-medium">{stat.label}</div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md p-6 border border-white/20">
                  <img
                    src={heroImages[heroIndex]}
                    alt={`Showcase ${heroIndex + 1}`}
                    className="w-full h-[500px] object-cover rounded-2xl transition-all duration-700 hover:scale-105"
                  />
                </div>
                
                {/* Floating badges */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={statsVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -top-6 -right-6"
                >
                  <div className="px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-xl backdrop-blur-md border border-white/25" 
                       style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    ✨ Premium Quality
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={statsVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="absolute -bottom-6 -left-6"
                >
                  <div className="px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-xl backdrop-blur-md border border-white/25"
                       style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                    🏆 Since 1991
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top Seller Products Section */}
      <section className="py-24 px-6 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Top Seller{' '}
              <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                Products
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Our most popular and highly-rated signage solutions that businesses love
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-pink-400 mx-auto"></div>
              <p className="mt-6 text-white/70 text-lg">Loading amazing products...</p>
            </div>
          ) : topSellerProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {topSellerProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 group-hover:scale-105 shadow-xl overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-white/10 to-white/5 overflow-hidden">
                      {product.image_url ? (
                        <ProductImageSlider imageUrls={product.image_url} productName={product.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center p-6">
                            <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                              <ShoppingCart className="w-10 h-10 text-white/70" />
                            </div>
                            <p className="text-white/60 font-medium">No Image Available</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-4">
                        <span className="inline-block bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs font-bold px-3 py-2 rounded-full">
                          {product.category?.name}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-200 transition-colors">
                        {product.name}
                      </h3>
                      
                      {product.description && (
                        <p className="text-white/70 mb-6 leading-relaxed line-clamp-2">{product.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-white/60">
                          {product.sizes && product.sizes.length > 0 && (
                            <span className="block mb-1">📏 {product.sizes.slice(0, 2).join(', ')}</span>
                          )}
                          {product.materials && product.materials.length > 0 && (
                            <span className="block">🏗️ {product.materials.slice(0, 2).join(', ')}</span>
                          )}
                        </div>
                        <Link 
                          href={`/products/${product.id}`} 
                          className="px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
                        >
                          Get Quote
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-full mx-auto mb-6 flex items-center justify-center border border-white/20">
                <ShoppingCart className="w-16 h-16 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No products available yet</h3>
              <p className="text-white/70 text-lg">Check back soon for amazing signage solutions!</p>
            </div>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 px-6 bg-white/5 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/15 backdrop-blur-md rounded-full border border-white/25 mb-8">
              <span className="text-white font-bold">About Us</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
              Trusted{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Signage Partner
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Since 1991
              </span>
            </h2>
            
            <p className="text-xl text-white/80 max-w-5xl mx-auto leading-relaxed">
              Since 1991, <span className="font-bold text-white">Shree Krishna Signs</span> has been a trusted name in delivering 
              high-quality signage and printing solutions. With over three decades of experience, we specialize in creating 
              <span className="font-bold text-pink-300"> durable, customized, and impactful</span> signages that help businesses 
              elevate their brand presence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <p className="text-lg text-white/80 leading-relaxed">
                Our team, backed by advanced machinery like <span className="font-bold text-cyan-300">Eco-Solvent and UV Printers</span>, 
                <span className="font-bold text-pink-300"> Metal Photo Label machines</span>, <span className="font-bold text-yellow-300">Laser Cutters</span>, 
                and <span className="font-bold text-violet-300">Engraving tools</span>, ensures precision, durability, and innovative solutions 
                for a wide range of industries.
              </p>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Industries We Serve</h3>
                <div className="flex flex-wrap gap-4">
                  {['Manufacturing', 'Healthcare', 'Hospitality', 'Corporate', 'Education', 'Retail'].map((industry) => (
                    <div key={industry} className="flex items-center gap-3 px-6 py-3 bg-white/15 backdrop-blur-md rounded-full border border-white/25 hover:bg-white/20 transition-all duration-300">
                      <span className="w-3 h-3 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full"></span>
                      <span className="text-white font-semibold">{industry}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md p-6 border border-white/20">
                  <img
                    src="/6.png"
                    alt="Advanced printing and signage machinery"
                    className="w-full h-[400px] object-cover rounded-2xl transition-all duration-500 hover:scale-105"
                  />
                </div>
                
                {/* Floating accent */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-violet-500 rounded-full blur-xl opacity-60"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-xl opacity-60"></div>
              </div>
            </motion.div>
          </div>

          {/* Services Grid */}
          <div id="services" className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                Our{' '}
                <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                  Services
                </span>
              </h3>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">Complete range of signage and print solutions tailored to your needs</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {categories.map((service, index) => (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-white/20">
                    <div className="w-4 h-4 bg-gradient-to-r from-pink-400 to-violet-500 rounded-full"></div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-4 group-hover:text-pink-200 transition-colors">{service}</h4>
                  <p className="text-white/70 leading-relaxed">Premium quality solutions with durable and long-lasting results for your business needs.</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section
        id="clients"
        className="relative py-20 px-6 overflow-hidden bg-white/5 backdrop-blur-sm border-y border-white/10"
      >
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/15 backdrop-blur-md rounded-full border border-white/25 mb-6">
              <span className="text-white font-bold">Our Clients</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Industry Leaders
              </span>
            </h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">Building lasting partnerships with businesses across multiple industries</p>
          </motion.div>

          {/* Marquee container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-[400px] relative">
            {/* Column A (scroll up) */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 flex flex-col animate-marquee-up will-change-transform">
                {[...clientLogos, ...clientLogos].map((client, i) => (
                  <div key={`up-${i}-${client.name}`} className="flex items-center justify-center h-28 shrink-0">
                    <div className="bg-white/15 backdrop-blur-md rounded-2xl border border-white/25 shadow-xl px-8 py-6 hover:bg-white/20 transition-all duration-300">
                      <img 
                        src={client.src} 
                        alt={`${client.name} logo`} 
                        className="h-14 w-auto object-contain filter brightness-110" 
                        loading="eager" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column B (scroll down) */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 flex flex-col animate-marquee-down will-change-transform">
                {[...clientLogos, ...clientLogos].map((client, i) => (
                  <div key={`down-${i}-${client.name}`} className="flex items-center justify-center h-28 shrink-0">
                    <div className="bg-white/15 backdrop-blur-md rounded-2xl border border-white/25 shadow-xl px-8 py-6 hover:bg-white/20 transition-all duration-300">
                      <img 
                        src={client.src} 
                        alt={`${client.name} logo`} 
                        className="h-14 w-auto object-contain filter brightness-110" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Updated marquee CSS with 20% faster speed */}
        <style jsx global>{`
          @keyframes marquee-up {
            0% { transform: translateY(0%); }
            100% { transform: translateY(-50%); }
          }
          @keyframes marquee-down {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0%); }
          }
          .animate-marquee-up {
            animation: marquee-up 14.4s linear infinite;
          }
          .animate-marquee-down {
            animation: marquee-down 14.4s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-marquee-up, .animate-marquee-down { animation-duration: 0s; }
          }
        `}</style>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Ready to{' '}
              <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                Get Started?
              </span>
            </h2>
            <p className="text-xl text-white/80">Contact us today for a free consultation and quote</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10 mb-16">
            {[
              { icon: Phone, title: 'Call Us', info: '+91 9689941047', color: 'from-cyan-400 to-blue-500' },
              { icon: Mail, title: 'Email Us', info: 'shreekrishnasigns@gmail.com', color: 'from-pink-400 to-violet-500' },
              { icon: MapPin, title: 'Visit Us', info: 'Daund, Dist- Pune, Maharashtra, India', color: 'from-yellow-400 to-orange-500' }
            ].map((contact, index) => {
              const IconComponent = contact.icon
              return (
                <motion.div
                  key={contact.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
                >
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${contact.color} p-0.5`}>
                    <div className="w-full h-full bg-gray-900/80 rounded-2xl flex items-center justify-center">
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{contact.title}</h3>
                  <p className="text-white/80 font-medium">{contact.info}</p>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/products"
              className="inline-block px-12 py-6 rounded-2xl text-white font-bold text-xl shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)' }}
            >
              Get Your Free Quote Now ✨
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/90 backdrop-blur-md text-white py-20 px-6 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12 mb-16">
            <div className="xl:col-span-1">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
                  SKS
                </div>
                <div>
                  <div className="text-white font-bold text-xl">Shree Krishna Signs</div>
                  <div className="text-pink-300 font-medium">Since 1991</div>
                </div>
              </div>
              
              <p className="text-white/80 mb-8 leading-relaxed text-lg">
                Over three decades of excellence in delivering premium signage and printing solutions for businesses across all industries.
              </p>
              
              <div className="flex space-x-4">
                {[
                  { icon: Facebook, color: 'hover:bg-blue-600' },
                  { icon: Instagram, color: 'hover:bg-pink-600' },
                  { icon: Linkedin, color: 'hover:bg-blue-700' }
                ].map((social, index) => {
                  const IconComponent = social.icon
                  return (
                    <a
                      key={index}
                      href="#"
                      className={`w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center ${social.color} transition-all duration-300 hover:scale-110 border border-white/20`}
                      aria-label="Social media link"
                    >
                      <IconComponent size={20} />
                    </a>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-8 text-white">Our Services</h3>
              <ul className="space-y-4">
                {categories.slice(0, 6).map((service) => (
                  <li key={service} className="text-white/80 hover:text-white transition-colors cursor-pointer">
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-8 text-white">Quick Links</h3>
              <ul className="space-y-4">
                {[
                  { name: 'About Us', href: '#about' },
                  { name: 'Services', href: '#services' },
                  { name: 'Products', href: '/products' },
                  { name: 'Clients', href: '#clients' },
                  { name: 'Contact', href: '#contact' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-white/80 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-8 text-white">Contact Us</h3>
              <div className="space-y-6">
                <div className="text-white/80">
                  <strong className="text-white">Address:</strong><br />
                  Daund, Dist- Pune<br />
                  Maharashtra, India
                </div>
                <div className="text-white/80">
                  <strong className="text-white">Phone:</strong><br />
                  +91 9689941047
                </div>
                <div className="text-white/80">
                  <strong className="text-white">Email:</strong><br />
                  shreekrishnasigns@gmail.com
                </div>
                <div className="text-white/80">
                  <strong className="text-white">Hours:</strong><br />
                  Mon - Sat: 9:00 AM - 7:00 PM
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-10">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
              <div className="text-white/70">© 2025 Shree Krishna Signs. All rights reserved.</div>
              <div className="flex items-center space-x-8">
                <a href="#privacy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</a>
                <span className="text-white/40">|</span>
                <a href="#terms" className="text-white/70 hover:text-white transition-colors">Terms of Service</a>
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

  // Auto-play functionality
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
        <div className="text-center p-6">
          <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
            <ShoppingCart className="w-10 h-10 text-white/70" />
          </div>
          <p className="text-white/60 font-medium">No Image Available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <img
        src={urls[currentImageIndex]}
        alt={`${productName} - Image ${currentImageIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-500"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.nextElementSibling?.classList.remove('hidden')
        }}
      />
      
      <div className="hidden w-full h-full flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
            <ShoppingCart className="w-10 h-10 text-white/70" />
          </div>
          <p className="text-white/60 font-medium">Image Error</p>
        </div>
      </div>
      
      {/* Navigation arrows - only show if multiple images */}
      {urls.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          {/* Image indicators */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {urls.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-white scale-110' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
