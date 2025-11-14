'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight } from 'lucide-react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 h-20">
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src="/logo.png?v=2" 
                alt="SKS Logo" 
                className="object-contain"
                style={{ width: '90px', height: '90px' }}
              />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-xl tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Shree Krishna Signs
              </h1>
              <p className="text-gray-500 text-sm font-medium">Since 1991</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            {[
              { name: 'Services', href: '/#services' },
              { name: 'Products', href: '/products' },
              { name: 'About', href: '/#about' },
              { name: 'Clients', href: '/#clients' },
              { name: 'Visit Us', href: '/#visit' },
              { name: 'Contact', href: '/#contact' }
            ].map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className="text-gray-700 hover:text-gray-900 font-medium text-base transition-colors relative group py-2"
              >
                {item.name}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></div>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            <Link 
              href="/products" 
              className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-semibold text-sm transition-colors"
            >
              Get Quote
            </Link>
            <a
              href="tel:+918380848305"
              className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2"
            >
              Call +91 83808 48305
              <ArrowRight size={16} />
            </a>
          </div>

          <button
            className="lg:hidden p-2 text-gray-700 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg">
          <nav className="px-6 py-6 space-y-4">
            {[
              { name: 'Services', href: '/#services' },
              { name: 'Products', href: '/products' },
              { name: 'About', href: '/#about' },
              { name: 'Clients', href: '/#clients' },
              { name: 'Visit Us', href: '/#visit' },
              { name: 'Contact', href: '/#contact' }
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-2 text-gray-700 hover:text-gray-900 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-3">
              <Link 
                href="/products"
                className="block px-4 py-2 text-center border border-gray-200 rounded-lg font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Quote
              </Link>
              <a
                href="tel:+918380848305"
                className="block px-4 py-2 text-center bg-gray-900 text-white rounded-lg font-semibold"
              >
                Call +91 83808 48305
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}


