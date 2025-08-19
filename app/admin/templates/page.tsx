'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  MessageSquare,
  Users
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Template {
  id: string
  type: 'customer' | 'supplier'
  category: string | null
  title: string
  content: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface TemplateForm {
  type: 'customer' | 'supplier'
  category: string
  title: string
  content: string
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [formData, setTemplateForm] = useState<TemplateForm>({
    type: 'customer',
    category: '',
    title: '',
    content: ''
  })

  const customerCategories = [
    'acknowledgement',
    'quotation_reply',
    'order_confirmation',
    'custom'
  ]

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      router.push('/admin')
      return
    }

    fetchTemplates()
  }, [router])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('type')
        .order('category')

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof TemplateForm, value: any) => {
    setTemplateForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    try {
      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('templates')
          .update({
            type: formData.type,
            category: formData.category || null,
            title: formData.title,
            content: formData.content
          })
          .eq('id', editingTemplate.id)

        if (error) throw error
        toast.success('Template updated successfully')
      } else {
        // Create new template
        const { error } = await supabase
          .from('templates')
          .insert({
            type: formData.type,
            category: formData.category || null,
            title: formData.title,
            content: formData.content
          })

        if (error) throw error
        toast.success('Template created successfully')
      }

      setShowAddForm(false)
      setEditingTemplate(null)
      setTemplateForm({
        type: 'customer',
        category: '',
        title: '',
        content: ''
      })
      fetchTemplates()
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save template')
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setTemplateForm({
      type: template.type,
      category: template.category || '',
      title: template.title,
      content: template.content
    })
    setShowAddForm(true)
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error

      toast.success('Template deleted successfully')
      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    }
  }

  const handleToggleActive = async (template: Template) => {
    try {
      const { error } = await supabase
        .from('templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id)

      if (error) throw error

      toast.success(`Template ${template.is_active ? 'deactivated' : 'activated'} successfully`)
      fetchTemplates()
    } catch (error) {
      console.error('Error updating template:', error)
      toast.error('Failed to update template')
    }
  }

  const resetForm = () => {
    setShowAddForm(false)
    setEditingTemplate(null)
    setTemplateForm({
      type: 'customer',
      category: '',
      title: '',
      content: ''
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Template Management</h1>
                <p className="text-sm text-gray-600">Manage communication templates</p>
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
            <a href="/admin/products" className="text-gray-500 hover:text-primary-600 font-medium">
              Products
            </a>
            <a href="/admin/enquiries" className="text-gray-500 hover:text-primary-600 font-medium">
              Enquiries
            </a>
            <a href="/admin/inventory" className="text-gray-500 hover:text-primary-600 font-medium">
              Inventory
            </a>
            <a href="/admin/templates" className="text-primary-600 border-b-2 border-primary-600 pb-2 font-medium">
              Templates
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Communication Templates</h2>
            <p className="text-gray-600 mt-1">Manage customer and supplier communication templates</p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Template</span>
          </button>
        </div>

        {/* Add/Edit Template Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTemplate ? 'Edit Template' : 'Add New Template'}
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
                    Template Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as 'customer' | 'supplier')}
                    className="input-field"
                    required
                  >
                    <option value="customer">Customer Template</option>
                    <option value="supplier">Supplier Template</option>
                  </select>
                </div>
                
                {formData.type === 'customer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select category</option>
                      {customerCategories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="input-field"
                  placeholder="Enter template title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  className="input-field"
                  rows={8}
                  placeholder="Enter template content. Use placeholders like {customer_name}, {product_name}, etc."
                  required
                />
                <div className="mt-2 text-sm text-gray-500">
                  <strong>Available placeholders:</strong>
                  {formData.type === 'customer' ? (
                    <span> {'{customer_name}'}, {'{product_name}'}, {'{quotation_id}'}, {'{delivery_date}'}</span>
                  ) : (
                    <span> {'{item_name}'}, {'{quantity}'}, {'{threshold}'}, {'{supplier_name}'}</span>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingTemplate ? 'Update Template' : 'Create Template'}</span>
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

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Customer Templates</h3>
            </div>
            
            <div className="space-y-3">
              {templates
                .filter(t => t.type === 'customer')
                .map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{template.title}</h4>
                        {template.category && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                            {template.category.replace('_', ' ')}
                          </span>
                        )}
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {template.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Updated: {formatDate(template.updated_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleToggleActive(template)}
                          className={`px-2 py-1 text-xs rounded-full ${
                            template.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {template.is_active ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              
              {templates.filter(t => t.type === 'customer').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No customer templates found</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Supplier Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Supplier Templates</h3>
            </div>
            
            <div className="space-y-3">
              {templates
                .filter(t => t.type === 'supplier')
                .map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{template.title}</h4>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {template.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Updated: {formatDate(template.updated_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleToggleActive(template)}
                          className={`px-2 py-1 text-xs rounded-full ${
                            template.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {template.is_active ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              
              {templates.filter(t => t.type === 'supplier').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No supplier templates found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
