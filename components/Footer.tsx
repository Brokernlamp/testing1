import Link from 'next/link'
import { Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  const categories = [
    'Signage Boards',
    'Letter Painting', 
    'Screen Printing',
    'Engraving & Etching',
    'Laser Cutting',
    'Eco-Solvent & UV Printing',
  ]

  return (
    <footer className="bg-black text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                <span className="text-black font-bold text-lg">SKS</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Shree Krishna Signs
                </h3>
                <p className="text-gray-400 text-sm">Since 1991</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Over three decades of excellence in delivering premium signage and printing solutions.
            </p>
            <div className="flex space-x-4">
              {[
                {
                  label: 'LinkedIn',
                  href: 'https://www.linkedin.com/company/shree-krishna-signs/',
                  Icon: Linkedin
                },
                {
                  label: 'Instagram',
                  href: 'https://www.instagram.com/shree.krishna.signs?igsh=MW5weXdsdjJyeHZ2NQ%3D%3D&utm_source=qr',
                  Icon: Instagram
                }
              ].map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Services</h4>
            <ul className="space-y-3">
              {categories.map((service) => (
                <li key={service} className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Company</h4>
            <ul className="space-y-3">
              {[
                { name: 'About Us', href: '#about' },
                { name: 'Services', href: '#services' },
                { name: 'Products', href: '/products' },
                { name: 'Clients', href: '#clients' },
                { name: 'Contact', href: '#contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Contact</h4>
            <div className="space-y-4">
              <div className="text-gray-300">
                <p className="font-medium">Address</p>
                <p className="text-sm">Daund Patas Road, Shree Krishna Signs, Pune, Maharashtra</p>
              </div>
              <div className="text-gray-300">
                <p className="font-medium">Phone</p>
                <p className="text-sm">
                  <a href="tel:+918380848305" className="hover:text-white transition-colors">
                    +91 83808 48305
                  </a>
                </p>
              </div>
              <div className="text-gray-300">
                <p className="font-medium">Email</p>
                <p className="text-sm">shreekrishnasigns@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm">
              © 2025 Shree Krishna Signs. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="/terms.pdf" download className="text-gray-400 hover:text-white text-sm transition-colors">Terms & Conditions (PDF)</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


