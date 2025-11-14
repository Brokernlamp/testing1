'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Phone, Mail, MapPin, ChevronLeft, ChevronRight, Menu, X, Play, Award, Users, Calendar, Facebook, Instagram, Linkedin, ArrowRight, Star, Check, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image, { type StaticImageData } from 'next/image'
import signboardPng from '@/Services/signboard.png'
import letterPaintingPng from '@/Services/Letter painting.png'
import screenPrintingPng from '@/Services/Screen printing .png'
import laserCuttingPng from '@/Services/laser-cutting-machine.png'
import laserPng from '@/Services/laser.png'
import solventUvPng from '@/Services/Solvent and uv printing .png'
import safetyPosterPng from '@/Services/Safety poster.png'
import glowNightPng from '@/Services/Glow night.png'
import laminationPng from '@/Services/Lamination.png'
import offsetPng from '@/Services/offset.png'

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
    'Lamination',
    'Offset Printing'
  ]

  const serviceImageFor = (name: string): StaticImageData => {
    const map: Record<string, StaticImageData> = {
      'Signage Boards': signboardPng,
      'Letter Painting': letterPaintingPng,
      'Screen Printing': screenPrintingPng,
      'Engraving & Etching': laserCuttingPng,
      'Laser Cutting': laserPng,
      'Eco-Solvent & UV Printing': solventUvPng,
      'Safety Posters & Industrial Labels': safetyPosterPng,
      'Night Glow Painting': glowNightPng,
      'Lamination': laminationPng,
      'Offset Printing': offsetPng,
    }
    return map[name] || signboardPng
  }

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

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (heroImages.length <= 1) return
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

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
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Hero Section - Modern Layout */}
      <section className="pt-12 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-8">
                <Star size={16} className="text-blue-600" />
                <span className="text-blue-700 font-semibold text-sm">Trusted Since 1991</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Premium{' '}
                <span className="text-blue-600">Signage</span>
                <br />
                <span className="text-gray-700">Solutions</span>
              </h1>

              {/* Subheading */}
              <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-lg">
                Over three decades of expertise in creating durable, customized, and impactful signages for businesses across all industries.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/products"
                  className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-lg rounded-xl transition-colors flex items-center gap-2 justify-center"
                >
                  Get Free Quote
                  <ArrowRight size={20} />
                </Link>
                <a
                  href="tel:+918380848305"
                  className="px-8 py-4 border border-gray-200 hover:border-gray-300 text-gray-900 font-semibold text-lg rounded-xl transition-colors flex items-center gap-2 justify-center"
                >
                  <Phone size={18} />
                  Call +91 83808 48305
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8">
                {[
                  { icon: Calendar, value: '33+', label: 'Years' },
                  { icon: Users, value: '1000+', label: 'Clients' },
                  { icon: Award, value: '50+', label: 'Industries' },
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
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3 mx-auto">
                        <IconComponent size={20} className="text-gray-700" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Right Content - Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <img
                  src={heroImages[heroIndex]}
                  alt="Signage showcase"
                  className="w-full h-[600px] object-cover rounded-3xl shadow-2xl"
                />
                
                {/* Floating Cards */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={statsVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Check size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Premium Quality</p>
                      <p className="text-gray-600 text-xs">Guaranteed</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={statsVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Zap size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Fast Delivery</p>
                      <p className="text-gray-600 text-xs">On Time</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Our <span className="text-blue-600">Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete range of signage and print solutions tailored to your business needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((service, index) => (
              <motion.div
                key={service}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gray-100 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                  <Image src={serviceImageFor(service)} alt={service} width={48} height={48} className="w-12 h-12 object-contain" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service}</h3>
                <p className="text-gray-600 leading-relaxed">Premium quality solutions with durable and long-lasting results for your business.</p>
                <div className="mt-6 flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Learn More
                  <ArrowRight size={16} className="ml-1 group-hover:ml-0 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Seller Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Featured <span className="text-blue-600">Products</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our most popular and highly-rated signage solutions
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : topSellerProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topSellerProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {product.image_url ? (
                      <ProductImageSlider imageUrls={product.image_url} productName={product.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center p-6">
                          <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No Image</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {product.category?.name}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="text-gray-600 mb-6 line-clamp-2">{product.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {product.sizes && product.sizes.length > 0 && (
                          <span className="block">Sizes: {product.sizes.slice(0, 2).join(', ')}</span>
                        )}
                      </div>
                      <Link 
                        href={`/products/${product.id}`}
                        className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-xl transition-colors"
                      >
                        Get Quote
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-600">Check back soon for amazing products!</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="mb-8">
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 font-semibold text-sm rounded-full mb-6">
                  About Us
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Trusted Partner <br />
                  <span className="text-blue-600">Since 1991</span>
                </h2>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Since 1991, <span className="font-semibold text-gray-900">Shree Krishna Signs</span> has been a trusted name in delivering high-quality signage and printing solutions. With over three decades of experience, we specialize in creating durable, customized, and impactful signages.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Advanced Eco-Solvent & UV Printing Technology',
                  'Precision Laser Cutting & Engraving Services',
                  'Custom Metal Photo Label Solutions',
                  'Comprehensive Safety & Industrial Labeling'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors"
              >
                View Our Work
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="/6.png"
                alt="Advanced machinery"
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
              />
              
              {/* Stats Card */}
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">1000+</div>
                    <div className="text-gray-600 text-sm">Happy Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">50+</div>
                    <div className="text-gray-600 text-sm">Industries</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Clients Section - Modern Grid */}
      <section id="clients" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Trusted by <span className="text-blue-600">Industry Leaders</span>
            </h2>
            <p className="text-xl text-gray-600">Building partnerships across multiple industries</p>
          </motion.div>

          {/* Two-Row Continuous Moving Client Logos */}
          <div className="space-y-8">
            {/* Top Row - Moving Left */}
            <div className="overflow-hidden">
              <div className="flex animate-marquee-left space-x-8">
                {[...clientLogos, ...clientLogos, ...clientLogos].map((client, i) => (
                  <div key={`top-${i}-${client.name}`} className="flex-shrink-0">
                    <div className="w-32 h-20 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-xl flex items-center justify-center hover:shadow-md transition-all duration-300">
                      <img 
                        src={client.src} 
                        alt={`${client.name} logo`} 
                        className="h-6 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Row - Moving Right */}
            <div className="overflow-hidden">
              <div className="flex animate-marquee-right space-x-8">
                {[...clientLogos, ...clientLogos, ...clientLogos].map((client, i) => (
                  <div key={`bottom-${i}-${client.name}`} className="flex-shrink-0">
                    <div className="w-32 h-20 bg-gradient-to-br from-green-50 to-yellow-50 border border-green-100 rounded-xl flex items-center justify-center hover:shadow-md transition-all duration-300">
                      <img 
                        src={client.src} 
                        alt={`${client.name} logo`} 
                        className="h-6 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Ready to <span className="text-blue-400">Get Started?</span>
            </h2>
            <p className="text-xl text-gray-300">Contact us today for a free consultation and quote</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Phone, title: 'Call Us', info: '+91 83808 48305', color: 'bg-blue-600', href: 'tel:+918380848305' },
              { icon: Mail, title: 'Email Us', info: 'shreekrishnasigns@gmail.com', color: 'bg-green-600', href: 'mailto:shreekrishnasigns@gmail.com' },
              { icon: MapPin, title: 'Visit Us', info: 'Daund Patas Road, Shree Krishna Signs, Pune', color: 'bg-purple-600', href: 'https://www.google.com/maps/search/?api=1&query=Daund+Patas+Road+Shree+Krishna+Signs' }
            ].map((contact, index) => {
              const IconComponent = contact.icon
              return (
                <motion.div
                  key={contact.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center p-8 bg-gray-800 rounded-3xl border border-gray-700 hover:bg-gray-750 transition-colors"
                >
                  <div className={`w-16 h-16 ${contact.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{contact.title}</h3>
                  {contact.href ? (
                    <a href={contact.href} target={contact.title === 'Visit Us' ? '_blank' : undefined} rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                      {contact.info}
                    </a>
                  ) : (
                    <p className="text-gray-300">{contact.info}</p>
                  )}
                </motion.div>
              )
            })}
          </div>

          <div id="visit" className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 text-left">
              <h3 className="text-2xl font-semibold text-white mb-4">Visit Us</h3>
              <p className="text-gray-300 mb-4">
                Daund Patas Road, Shree Krishna Signs, near Patas MIDC, Pune, Maharashtra
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Schedule a visit or drop by our workshop—our team will guide you through signage options and material finishes in person.
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Daund+Patas+Road+Shree+Krishna+Signs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold transition-colors"
              >
                <MapPin size={18} />
                Open Google Maps
              </a>
            </div>
            <div className="rounded-3xl overflow-hidden border border-gray-700 shadow-2xl">
              <iframe
                src="https://www.google.com/maps?q=Daund+Patas+Road+Shree+Krishna+Signs&output=embed"
                className="w-full h-80 md:h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shree Krishna Signs location"
              />
            </div>
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl transition-colors"
            >
              Get Your Free Quote
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
      
    </div>
  )
}

// Product Image Slider Component
function ProductImageSlider({ imageUrls, productName }: { imageUrls: string, productName: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

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

  useEffect(() => {
    if (urls.length <= 1 || isHovered) return
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % urls.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [urls.length, isHovered])

  if (urls.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No Image</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="relative w-full h-full group" 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={urls[currentImageIndex]}
        alt={`${productName} - Image ${currentImageIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-500"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.nextElementSibling?.classList.remove('hidden')
        }}
      />
      
      <div className="hidden w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Image Error</p>
        </div>
      </div>
      
      {urls.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {urls.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? 'bg-white scale-110' : 'bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
