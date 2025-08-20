'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MessageSquare, Plus, Search, Eye, Edit, Trash2, Reply, CheckCircle, Clock, AlertCircle, Download, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  'pending',
  'po_pending',
  'order_confirmed',
  'incorrect_po',
  'artwork_sent',
  'wip',
  'replied',
  'completed',
  'cancelled'
]

interface Enquiry {
  id: string
  customer_id: string
  product_id: string
  size: string | null
  quantity: number
  material: string | null
  delivery_date: string | null
  comments: string | null
  status: string
  reply_template_id: string | null
  quotation_amount: number | null
  invoice_number: string | null
  created_at: string
  updated_at: string
  customer: {
    company_name: string
    email: string | null
    phone: string | null
  }
  product: {
    name: string
  }
}

interface Template {
  id: string
  title: string
  content: string
}

export default function AdminEnquiriesPage() {
  const router = useRouter()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showInvoicePrompt, setShowInvoicePrompt] = useState<{ open: boolean, id: string | null}>({ open: false, id: null })
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [replyData, setReplyData] = useState({
    template_id: '',
    quotation_amount: ''
  })
  const [showManualEnquiryForm, setShowManualEnquiryForm] = useState(false)
  const [manualEnquiryData, setManualEnquiryData] = useState({
    company_name: '',
    email: '',
    phone: '',
    product_id: '',
    size: '',
    quantity: 1,
    material: '',
    delivery_date: '',
    comments: ''
  })

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      router.push('/admin')
      return
    }

    fetchEnquiries()
    fetchTemplates()
    fetchProducts()
  }, [router])

  const fetchEnquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select(`
          *,
          customer:customers(company_name, email, phone),
          product:products(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEnquiries(data || [])
    } catch (error) {
      console.error('Error fetching enquiries:', error)
      toast.error('Failed to load enquiries')
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('type', 'customer')
        .eq('is_active', true)
        .order('title')

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleManualEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!manualEnquiryData.company_name.trim() || !manualEnquiryData.product_id) {
      toast.error('Company name and product are required')
      return
    }

    try {
      // First, create or find customer
      let customerId: string
      
      const { data: existingCustomer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('company_name', manualEnquiryData.company_name.trim())
        .single()

      if (existingCustomer) {
        customerId = existingCustomer.id
      } else {
        // Create new customer
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert({
            company_name: manualEnquiryData.company_name.trim(),
            email: manualEnquiryData.email.trim() || null,
            phone: manualEnquiryData.phone.trim() || null,
            source: 'manual'
          })
          .select('id')
          .single()

        if (createError) throw createError
        customerId = newCustomer.id
      }

      // Create enquiry
      const { error: enquiryError } = await supabase
        .from('enquiries')
        .insert({
          customer_id: customerId,
          product_id: manualEnquiryData.product_id,
          size: manualEnquiryData.size.trim() || null,
          quantity: manualEnquiryData.quantity,
          material: manualEnquiryData.material.trim() || null,
          delivery_date: manualEnquiryData.delivery_date || null,
          comments: manualEnquiryData.comments.trim() || null,
          status: 'pending'
        })

      if (enquiryError) throw enquiryError

      toast.success('Manual enquiry created successfully')
      setShowManualEnquiryForm(false)
      setManualEnquiryData({
        company_name: '',
        email: '',
        phone: '',
        product_id: '',
        size: '',
        quantity: 1,
        material: '',
        delivery_date: '',
        comments: ''
      })
      fetchEnquiries()
    } catch (error) {
      console.error('Error creating manual enquiry:', error)
      toast.error('Failed to create manual enquiry')
    }
  }

  const handleReply = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry)
    setReplyData({
      template_id: '',
      quotation_amount: ''
    })
    setShowReplyForm(true)
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedEnquiry) return

    try {
      const updateData: any = {
        status: 'replied',
        updated_at: new Date().toISOString()
      }

      if (replyData.quotation_amount) {
        updateData.quotation_amount = parseFloat(replyData.quotation_amount)
      }

      if (replyData.template_id) {
        updateData.reply_template_id = replyData.template_id
      }

      const { error } = await supabase
        .from('enquiries')
        .update(updateData)
        .eq('id', selectedEnquiry.id)

      if (error) throw error

      // log activity
      await supabase.from('enquiry_activity').insert({ enquiry_id: selectedEnquiry.id, action: 'reply', note: `template: ${replyData.template_id}${replyData.quotation_amount ? `, quotation: ${replyData.quotation_amount}` : ''}` })

      toast.success('Enquiry updated successfully')
      setShowReplyForm(false)
      setSelectedEnquiry(null)
      fetchEnquiries()
    } catch (error) {
      console.error('Error updating enquiry:', error)
      toast.error('Failed to update enquiry')
    }
  }

  const handleStatusChange = async (enquiryId: string, newStatus: string) => {
    try {
      if (newStatus === 'completed') {
        setShowInvoicePrompt({ open: true, id: enquiryId })
        return
      }
      const { error } = await supabase
        .from('enquiries')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', enquiryId)

      if (error) throw error

      // log activity
      await supabase.from('enquiry_activity').insert({ enquiry_id: enquiryId, action: 'status_change', note: newStatus })
      toast.success('Status updated successfully')
      fetchEnquiries()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const confirmCompleteWithInvoice = async () => {
    if (!showInvoicePrompt.id) return
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ status: 'completed', invoice_number: invoiceNumber, updated_at: new Date().toISOString() })
        .eq('id', showInvoicePrompt.id)
      if (error) throw error
      await supabase.from('enquiry_activity').insert({ enquiry_id: showInvoicePrompt.id, action: 'status_change', note: `completed with invoice ${invoiceNumber}` })
      toast.success('Marked as completed')
    } catch (e) {
      toast.error('Failed to complete enquiry')
    } finally {
      setShowInvoicePrompt({ open: false, id: null })
      setInvoiceNumber('')
      fetchEnquiries()
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const bulkUpdateStatus = async (status: string) => {
    if (selectedIds.size === 0) return toast.error('Select enquiries first')
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', Array.from(selectedIds))
      if (error) throw error
      toast.success('Status updated')
      setSelectedIds(new Set())
      fetchEnquiries()
    } catch (e) {
      toast.error('Bulk update failed')
    }
  }

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return toast.error('Select enquiries first')
    if (!confirm('Delete selected enquiries?')) return
    try {
      const { error } = await supabase
        .from('enquiries')
        .delete()
        .in('id', Array.from(selectedIds))
      if (error) throw error
      toast.success('Deleted selected')
      setSelectedIds(new Set())
      fetchEnquiries()
    } catch (e) {
      toast.error('Bulk delete failed')
    }
  }

  const exportCsv = () => {
    const rows = [
      ['ID','Customer','Email','Phone','Product','Size','Quantity','Material','Delivery Date','Status','Quotation','Invoice Number','Created At']
    ]
    for (const e of enquiries) {
      rows.push([
        e.id,
        e.customer.company_name,
        e.customer.email || '',
        e.customer.phone || '',
        e.product.name,
        e.size || '',
        String(e.quantity),
        e.material || '',
        e.delivery_date || '',
        e.status,
        e.quotation_amount ? String(e.quotation_amount) : '',
        e.invoice_number || '',
        e.created_at,
      ])
    }
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'enquiries.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async (enquiryId: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return

    try {
      const { error } = await supabase
        .from('enquiries')
        .delete()
        .eq('id', enquiryId)

      if (error) throw error

      toast.success('Enquiry deleted successfully')
      fetchEnquiries()
    } catch (error) {
      console.error('Error deleting enquiry:', error)
      toast.error('Failed to delete enquiry')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'po_pending':
        return 'bg-amber-100 text-amber-800'
      case 'order_confirmed':
        return 'bg-indigo-100 text-indigo-800'
      case 'incorrect_po':
        return 'bg-orange-100 text-orange-800'
      case 'artwork_sent':
        return 'bg-purple-100 text-purple-800'
      case 'wip':
        return 'bg-sky-100 text-sky-800'
      case 'replied':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'replied':
        return <Reply className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  // Deterministic color per company for visual grouping
  const getCompanyColor = (name: string) => {
    const palette = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#06b6d4','#84cc16','#f97316']
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
    return palette[hash % palette.length]
  }

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = 
      enquiry.customer.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enquiry.comments && enquiry.comments.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = !statusFilter || enquiry.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading enquiries...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Enquiry Management</h1>
                <p className="text-sm text-gray-600">Manage customer enquiries and quotations</p>
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
            <a href="/admin/enquiries" className="text-primary-600 border-b-2 border-primary-600 pb-2 font-medium">
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
            <h2 className="text-2xl font-bold text-gray-900">Customer Enquiries</h2>
            <p className="text-gray-600 mt-1">Manage and respond to customer enquiries</p>
          </div>
          
          <button
            onClick={() => setShowManualEnquiryForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Manual Enquiry</span>
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Search by company, product, or comments..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Enquiries Table */}
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <select className="input-field text-sm" onChange={(e)=>{const v=e.target.value; if(!v) return; if(v==='delete') bulkDelete(); else bulkUpdateStatus(v); e.currentTarget.selectedIndex=0}}>
                <option value="">Bulk actions</option>
                {STATUS_OPTIONS.map(s => (<option key={s} value={s}>Set {s}</option>))}
                <option value="delete">Delete Selected</option>
              </select>
            </div>
            <button onClick={exportCsv} className="btn-primary text-sm flex items-center space-x-1"><Download className="w-4 h-4" /><span>Export CSV</span></button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <input type="checkbox" onChange={(e)=> setSelectedIds(e.target.checked ? new Set(filteredEnquiries.map(e=>e.id)) : new Set())} />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer/Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-gray-50 border-l-4" style={{ borderLeftColor: getCompanyColor(enquiry.customer.company_name) }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" checked={selectedIds.has(enquiry.id)} onChange={()=>toggleSelect(enquiry.id)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {enquiry.customer.company_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {enquiry.customer.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {enquiry.customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{enquiry.product.name}</div>
                      <div className="text-sm text-gray-500">
                        Qty: {enquiry.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {enquiry.size && <div>Size: {enquiry.size}</div>}
                        {enquiry.material && <div>Material: {enquiry.material}</div>}
                        {enquiry.delivery_date && (
                          <div>Delivery: {formatDate(enquiry.delivery_date)}</div>
                        )}
                        {enquiry.quotation_amount && (
                          <div className="font-medium text-green-600">
                            {formatCurrency(enquiry.quotation_amount)}
                          </div>
                        )}
                        {enquiry.invoice_number && (
                          <div className="font-medium text-blue-600">
                            Invoice: {enquiry.invoice_number}
                          </div>
                        )}
                      </div>
                      {enquiry.comments && (
                        <div className="text-sm text-gray-500 mt-1">
                          {enquiry.comments}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                        {getStatusIcon(enquiry.status)}
                        <span className="ml-1">{enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(enquiry.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <select className="input-field text-xs" value="" onChange={(e)=>{const v=e.target.value; if(!v) return; if(v==='reply') handleReply(enquiry); else if(v==='delete') handleDelete(enquiry.id); else handleStatusChange(enquiry.id, v); e.currentTarget.selectedIndex=0}}>
                          <option value="">Actions</option>
                          {STATUS_OPTIONS.map(s => (<option key={s} value={s}>Set {s}</option>))}
                          <option value="reply">Reply</option>
                          <option value="delete">Delete</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEnquiries.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No enquiries found</p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Form Modal */}
      {showReplyForm && selectedEnquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reply to Enquiry
              </h3>
              
              <form onSubmit={handleReplySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reply Template
                  </label>
                  <select
                    value={replyData.template_id}
                    onChange={(e) => setReplyData(prev => ({ ...prev, template_id: e.target.value }))}
                    className="input-field"
                    required
                  >
                    <option value="">Select template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quotation Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={replyData.quotation_amount}
                    onChange={(e) => setReplyData(prev => ({ ...prev, quotation_amount: e.target.value }))}
                    className="input-field"
                    placeholder="Enter quotation amount"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Send Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReplyForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manual Enquiry Form Modal */}
      {showManualEnquiryForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Create Manual Enquiry
                </h3>
                <button
                  onClick={() => setShowManualEnquiryForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleManualEnquirySubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={manualEnquiryData.company_name}
                      onChange={(e) => setManualEnquiryData(prev => ({ ...prev, company_name: e.target.value }))}
                      className="input-field"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={manualEnquiryData.email}
                      onChange={(e) => setManualEnquiryData(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={manualEnquiryData.phone}
                      onChange={(e) => setManualEnquiryData(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product *
                    </label>
                    <select
                      value={manualEnquiryData.product_id}
                      onChange={(e) => setManualEnquiryData(prev => ({ ...prev, product_id: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <input
                      type="text"
                      value={manualEnquiryData.size}
                      onChange={(e) => setManualEnquiryData(prev => ({ ...prev, size: e.target.value }))}
                      className="input-field"
                      placeholder="Enter size"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={manualEnquiryData.quantity}
                      onChange={(e) => setManualEnquiryData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material
                    </label>
                    <input
                      type="text"
                      value={manualEnquiryData.material}
                      onChange={(e) => setManualEnquiryData(prev => ({ ...prev, material: e.target.value }))}
                      className="input-field"
                      placeholder="Enter material"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    value={manualEnquiryData.delivery_date}
                    onChange={(e) => setManualEnquiryData(prev => ({ ...prev, delivery_date: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comments
                  </label>
                  <textarea
                    value={manualEnquiryData.comments}
                    onChange={(e) => setManualEnquiryData(prev => ({ ...prev, comments: e.target.value }))}
                    className="input-field"
                    rows={3}
                    placeholder="Additional comments..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Create Enquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManualEnquiryForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Prompt Modal */}
      {showInvoicePrompt.open && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Enter Invoice Number</h3>
              <input
                className="input-field w-full"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Invoice #"
              />
              <div className="flex space-x-3 pt-4">
                <button className="btn-primary flex-1" onClick={confirmCompleteWithInvoice}>Confirm</button>
                <button className="btn-secondary flex-1" onClick={() => { setShowInvoicePrompt({ open: false, id: null }); setInvoiceNumber('') }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
