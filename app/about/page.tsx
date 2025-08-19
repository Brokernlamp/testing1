'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Phone, Mail, MapPin, Clock, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-primary-600">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">About Us</h1>
                <p className="text-sm text-gray-600">Learn more about Shree Krishna Signs</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-primary-600 font-medium">
                Products
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600 font-medium">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Shree Krishna Signs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Since 1991, we've been delivering high-quality signage and printing solutions 
            that help businesses elevate their brand presence across India.
          </p>
        </motion.div>

        {/* Company Story */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Story
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Founded in 1991, Shree Krishna Signs began as a small family business with a vision 
              to provide exceptional signage solutions to local businesses. Over three decades, 
              we've grown into a trusted partner for companies across various industries.
            </p>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Our journey has been marked by continuous innovation, investment in advanced technology, 
              and unwavering commitment to quality. Today, we serve clients from manufacturing and 
              healthcare to hospitality and corporate sectors.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              What sets us apart is our personalized approach, attention to detail, and the ability 
              to turn our clients' vision into reality with precision and creativity.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-br from-primary-50 to-accent-50 p-8 rounded-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us?</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Award className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">30+ Years Experience</h4>
                  <p className="text-gray-600 text-sm">Decades of expertise in signage solutions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Award className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Advanced Technology</h4>
                  <p className="text-gray-600 text-sm">State-of-the-art machinery and tools</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Award className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Quality Assurance</h4>
                  <p className="text-gray-600 text-sm">Rigorous quality control processes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Award className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Customer Focus</h4>
                  <p className="text-gray-600 text-sm">Personalized service and support</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Services Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Signage Boards',
                description: 'Custom signage boards for businesses of all sizes'
              },
              {
                title: 'Letter Painting',
                description: 'Professional letter painting and typography services'
              },
              {
                title: 'Screen Printing',
                description: 'High-quality screen printing on various materials'
              },
              {
                title: 'Engraving & Etching',
                description: 'Precision engraving and etching solutions'
              },
              {
                title: 'Laser Cutting',
                description: 'Advanced laser cutting technology for precise cuts'
              },
              {
                title: 'Eco-Solvent & UV Printing',
                description: 'Environmentally friendly printing solutions'
              },
              {
                title: 'Safety Posters',
                description: 'Industrial safety and compliance posters'
              },
              {
                title: 'Industrial Labels',
                description: 'Durable labels for industrial applications'
              }
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="bg-primary-900 text-white rounded-2xl p-8 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Contact us today for a free consultation and quote
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-secondary text-lg px-8 py-3">
              Contact Us
            </Link>
            <Link href="/products" className="btn-primary text-lg px-8 py-3">
              View Products
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
