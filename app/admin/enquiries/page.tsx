'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MessageSquare, Plus, Search, Eye, Edit, Trash2, Reply, CheckCircle, Clock, AlertCircle, Download, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/ImageUpload'

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
  images?: string[] | null
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

type UnifiedItem = {
  id: string
  type: 'product' | 'custom'
  customer: { company_name: string; email: string | null; phone: string | null }
  productId?: string
  productName: string
  size: string | null
  quantity: number
  material: string | null
  delivery_date: string | null
  comments: string | null
  images?: string[] | null
  status: string
  invoice_number?: string | null
  created_at: string
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
  const [customOrders, setCustomOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [visibleColumns, setVisibleColumns] = useState<{ [key: string]: boolean }>({
    customer: true,
    product: true,
    details: true,
    invoice: true,
    images: true,
    status: true,
    datetime: true,
    actions: true,
  })
  const [showColumnsMenu, setShowColumnsMenu] = useState(false)
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [editingInvoiceValue, setEditingInvoiceValue] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showInvoicePrompt, setShowInvoicePrompt] = useState<{ open: boolean, id: string | null}>({ open: false, id: null })
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [replyData, setReplyData] = useState({
    template_id: '',
    quotation_amount: '',
    comment: '',
    images: [] as string[]
  })
  const [bulkTemplateId, setBulkTemplateId] = useState('')
  const [bulkStatus, setBulkStatus] = useState('')
  const [showBulkReply, setShowBulkReply] = useState(false)
  const [bulkReplyData, setBulkReplyData] = useState({ comment: '', images: [] as string[] })
  const [submittingReply, setSubmittingReply] = useState(false)
  const [showManualEnquiryForm, setShowManualEnquiryForm] = useState(false)
  const [manualEnquiryData, setManualEnquiryData] = useState({
    type: 'product' as 'product' | 'custom',
    company_name: '',
    email: '',
    phone: '',
    product_id: '',
    name: '',
    size: '',
    quantity: 1,
    material: '',
    delivery_date: '',
    comments: '',
    images: [] as string[]
  })

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      router.push('/admin')
      return
    }

    // Load persisted filters and column prefs
    try {
      const savedFilters = localStorage.getItem('adminEnq.filters')
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters)
        if (typeof parsed.searchQuery === 'string') setSearchQuery(parsed.searchQuery)
        if (typeof parsed.statusFilter === 'string') setStatusFilter(parsed.statusFilter)
      }
      const savedCols = localStorage.getItem('adminEnq.visibleColumns')
      if (savedCols) {
        const parsedCols = JSON.parse(savedCols)
        if (parsedCols && typeof parsedCols === 'object') setVisibleColumns((prev)=> ({...prev, ...parsedCols}))
      }
    } catch {}

    fetchEnquiries()
    fetchTemplates()
    fetchProducts()
    fetchCustomOrders()
  }, [router])

  // Persist filters and columns
  useEffect(() => {
    try {
      localStorage.setItem('adminEnq.filters', JSON.stringify({ searchQuery, statusFilter }))
    } catch {}
  }, [searchQuery, statusFilter])

  useEffect(() => {
    try {
      localStorage.setItem('adminEnq.visibleColumns', JSON.stringify(visibleColumns))
    } catch {}
  }, [visibleColumns])

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

  const fetchCustomOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_orders')
        .select(`*, customer:customers(company_name, email, phone)`) 
        .order('created_at', { ascending: false })
      if (error) throw error
      setCustomOrders(data || [])
    } catch (error) {
      console.error('Error fetching custom orders:', error)
    }
  }

  const handleManualEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!manualEnquiryData.company_name.trim()) return toast.error('Company name is required')
    if (manualEnquiryData.type === 'product' && !manualEnquiryData.product_id) return toast.error('Select a product')
    if (manualEnquiryData.type === 'custom' && !manualEnquiryData.name.trim()) return toast.error('Custom item name is required')

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

      if (manualEnquiryData.type === 'product') {
        // Create enquiry (product)
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
            images: manualEnquiryData.images || [],
            status: 'pending'
          })
        if (enquiryError) throw enquiryError
      } else {
        // Create custom order
        const { error: customErr } = await supabase
          .from('custom_orders')
          .insert({
            customer_id: customerId,
            order_id: `CUST-${Date.now()}`,
            name: manualEnquiryData.name.trim(),
            size: manualEnquiryData.size.trim() || null,
            material: manualEnquiryData.material.trim() || null,
            quantity: manualEnquiryData.quantity,
            images: manualEnquiryData.images || [],
            delivery_date: manualEnquiryData.delivery_date || null,
            comments: manualEnquiryData.comments.trim() || null,
            status: 'pending'
          })
        if (customErr) throw customErr
      }

      toast.success('Manual enquiry created successfully')
      setShowManualEnquiryForm(false)
      setManualEnquiryData({
        type: 'product',
        company_name: '',
        email: '',
        phone: '',
        product_id: '',
        name: '',
        size: '',
        quantity: 1,
        material: '',
        delivery_date: '',
        comments: '',
        images: []
      })
      fetchEnquiries(); fetchCustomOrders()
    } catch (error) {
      console.error('Error creating manual enquiry:', error)
      toast.error('Failed to create manual enquiry')
    }
  }

  const handleReply = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry)
    setReplyData({
      template_id: '',
      quotation_amount: '',
      comment: '',
      images: []
    })
    setShowReplyForm(true)
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedEnquiry) return

    try {
      setSubmittingReply(true)
      // Send email via API first with optional images/comment
      const res = await fetch('/api/admin-send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryIds: [selectedEnquiry.id],
          templateId: replyData.template_id,
          status: 'replied',
          extraImages: replyData.images,
          extraComment: replyData.comment
        })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to send reply')
      }

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

      toast.success('Reply sent successfully')
      setShowReplyForm(false)
      setSelectedEnquiry(null)
      fetchEnquiries()
    } catch (error) {
      console.error('Error updating enquiry:', error)
      toast.error('Failed to update enquiry')
    } finally {
      setSubmittingReply(false)
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

  const startEditInvoice = (id: string, current: string | null | undefined) => {
    setEditingInvoiceId(id)
    setEditingInvoiceValue(current || '')
  }

  const saveInvoice = async () => {
    if (!editingInvoiceId) return
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ invoice_number: editingInvoiceValue.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', editingInvoiceId)
      if (error) throw error
      await supabase.from('enquiry_activity').insert({ enquiry_id: editingInvoiceId, action: 'invoice_update', note: editingInvoiceValue.trim() || '' })
      toast.success('Invoice updated')
      setEditingInvoiceId(null)
      setEditingInvoiceValue('')
      fetchEnquiries()
    } catch (e) {
      toast.error('Failed to update invoice')
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
    if (status === 'completed' && selectedIds.size !== 1) return toast.error('Select one at a time')
    try {
      const ids = Array.from(selectedIds)
      const productIds = ids.filter(id => idToType.get(id) === 'product')
      const customIds = ids.filter(id => idToType.get(id) === 'custom')
      if (status === 'completed') {
        // ask for invoice number for product completion
        if (productIds.length === 1 && customIds.length === 0) {
          setShowInvoicePrompt({ open: true, id: productIds[0] })
          return
        }
      }
      if (productIds.length) {
        const { error } = await supabase
          .from('enquiries')
          .update({ status, updated_at: new Date().toISOString() })
          .in('id', productIds)
        if (error) throw error
      }
      if (customIds.length) {
        const { error } = await supabase
          .from('custom_orders')
          .update({ status, updated_at: new Date().toISOString() })
          .in('id', customIds)
        if (error) throw error
      }
      toast.success('Status updated')
      setSelectedIds(new Set())
      fetchEnquiries(); fetchCustomOrders()
    } catch (e) {
      toast.error('Bulk update failed')
    }
  }

  const handleBulkReply = async () => {
    if (selectedIds.size === 0) return toast.error('Select enquiries first')
    setShowBulkReply(true)
  }

  const submitBulkReply = async () => {
    if (!bulkTemplateId) return toast.error('Select a template')
    try {
      setSubmittingReply(true)
      const res = await fetch('/api/admin-send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryIds: Array.from(selectedIds),
          templateId: bulkTemplateId,
          status: bulkStatus || 'replied',
          extraImages: bulkReplyData.images,
          extraComment: bulkReplyData.comment
        })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to send replies')
      }
      toast.success('Replies sent successfully')
      setShowBulkReply(false)
      setSelectedIds(new Set())
      setBulkTemplateId('')
      setBulkStatus('')
      setBulkReplyData({ comment: '', images: [] })
      fetchEnquiries()
    } catch (e: any) {
      toast.error(e?.message || 'Bulk reply failed')
    } finally {
      setSubmittingReply(false)
    }
  }

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return toast.error('Select enquiries first')
    if (!confirm('Delete selected records?')) return
    try {
      const ids = Array.from(selectedIds)
      const productIds = ids.filter(id => idToType.get(id) === 'product')
      const customIds = ids.filter(id => idToType.get(id) === 'custom')
      // warn for any non-completed entries
      const warn = unified.filter(u => ids.includes(u.id) && u.status !== 'completed').length > 0
      if (warn) {
        const proceed = confirm('Some selected orders are not completed yet. Are you sure you want to delete?')
        if (!proceed) return
      }
      if (productIds.length) {
        const { error } = await supabase.from('enquiries').delete().in('id', productIds)
        if (error) throw error
      }
      if (customIds.length) {
        const { error } = await supabase.from('custom_orders').delete().in('id', customIds)
        if (error) throw error
      }
      toast.success('Deleted selected')
      setSelectedIds(new Set())
      fetchEnquiries(); fetchCustomOrders()
    } catch (e) {
      toast.error('Bulk delete failed')
    }
  }

  const handleStatusChangeUnified = async (entityId: string, newStatus: string) => {
    try {
      const t = idToType.get(entityId)
      if (!t) return
      if (newStatus === 'completed' && t === 'product') {
        setShowInvoicePrompt({ open: true, id: entityId })
        return
      }
      if (t === 'product') {
        const { error } = await supabase.from('enquiries').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', entityId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('custom_orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', entityId)
        if (error) throw error
      }
      toast.success('Status updated successfully')
      fetchEnquiries(); fetchCustomOrders()
    } catch (e) {
      toast.error('Failed to update status')
    }
  }

  const handleDeleteUnified = async (entityId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    try {
      const t = idToType.get(entityId)
      if (!t) return
      if (t === 'product') {
        const { error } = await supabase.from('enquiries').delete().eq('id', entityId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('custom_orders').delete().eq('id', entityId)
        if (error) throw error
      }
      toast.success('Deleted successfully')
      fetchEnquiries(); fetchCustomOrders()
    } catch (e) {
      toast.error('Failed to delete')
    }
  }

  const deleteAllRecords = async () => {
    if (!confirm('Delete ALL enquiries and custom orders? This cannot be undone.')) return
    try {
      const { error: e1 } = await supabase.from('enquiries').delete().neq('id', '')
      if (e1) throw e1
      const { error: e2 } = await supabase.from('custom_orders').delete().neq('id', '')
      if (e2) throw e2
      toast.success('All records deleted')
      fetchEnquiries()
      fetchCustomOrders()
    } catch (e) {
      console.error(e)
      toast.error('Delete all failed')
    }
  }

  const refreshAll = () => {
    fetchEnquiries()
    fetchCustomOrders()
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

  const filteredCustomOrders = customOrders.filter(order => {
    const matchesSearch = 
      (order.customer?.company_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.comments || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const unified: UnifiedItem[] = [
    ...filteredEnquiries.map(e => ({
      id: e.id,
      type: 'product' as const,
      customer: e.customer,
      productId: e.product_id,
      productName: e.product.name,
      size: e.size,
      quantity: e.quantity,
      material: e.material,
      delivery_date: e.delivery_date,
      comments: e.comments,
      images: e.images || [],
      status: e.status,
      invoice_number: e.invoice_number || null,
      created_at: e.created_at
    })),
    ...filteredCustomOrders.map((o: any) => ({
      id: o.id,
      type: 'custom' as const,
      customer: { company_name: o.customer?.company_name || '', email: o.customer?.email || null, phone: o.customer?.phone || null },
      productName: `Custom: ${o.name}`,
      size: o.size,
      quantity: o.quantity,
      material: o.material,
      delivery_date: o.delivery_date,
      comments: o.comments,
      images: o.images || [],
      status: o.status,
      invoice_number: o.invoice_number || null,
      created_at: o.created_at
    }))
  ].sort((a, b) => (a.created_at > b.created_at ? -1 : 1))

  // Map of id -> type to support bulk operations across both tables
  const idToType = new Map<string, 'product' | 'custom'>(unified.map(u => [u.id, u.type]))

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
              {selectedIds.size > 0 && (
                <>
                  <select className="input-field text-sm" value={bulkTemplateId} onChange={(e)=> setBulkTemplateId(e.target.value)}>
                    <option value="">Select template…</option>
                    {templates.map(t => (<option key={t.id} value={t.id}>{t.title}</option>))}
                  </select>
                  <select className="input-field text-sm" value={bulkStatus} onChange={(e)=> setBulkStatus(e.target.value)}>
                    <option value="">Optional status…</option>
                    {STATUS_OPTIONS.map(s => (<option key={s} value={s}>Set {s}</option>))}
                  </select>
                  <button className="btn-primary text-sm" onClick={handleBulkReply}>
                    Reply to customer (selected)
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button onClick={()=> setShowColumnsMenu(v=>!v)} className="btn-secondary text-sm">Columns</button>
                {showColumnsMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-10 p-2 space-y-1">
                    {Object.keys(visibleColumns).map((key) => (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!visibleColumns[key]} onChange={(e)=> setVisibleColumns(prev=> ({...prev, [key]: e.target.checked}))} />
                        <span className="capitalize">{key}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={exportCsv} className="btn-primary text-sm flex items-center space-x-1"><Download className="w-4 h-4" /><span>Export CSV</span></button>
              <button onClick={deleteAllRecords} className="btn-secondary text-sm">Delete All</button>
              <button onClick={refreshAll} className="btn-secondary text-sm flex items-center space-x-1"><RefreshCw className="w-4 h-4" /><span>Refresh</span></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <input type="checkbox" onChange={(e)=> setSelectedIds(e.target.checked ? new Set(unified.map(e=>e.id)) : new Set())} />
                  </th>
                  {visibleColumns.customer && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer/Company
                  </th>)}
                  {visibleColumns.product && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>)}
                  {visibleColumns.details && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>)}
                  {visibleColumns.invoice && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>)}
                  {visibleColumns.images && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images
                  </th>)}
                  {visibleColumns.status && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>)}
                  {visibleColumns.datetime && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & time
                  </th>)}
                  {visibleColumns.actions && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>)}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unified.map((row) => (
                  <tr key={`${row.type}-${row.id}`} className={`hover:bg-gray-50 border-l-4 ${row.type==='custom' ? 'bg-red-50/40' : ''}`} style={{ borderLeftColor: getCompanyColor(row.customer.company_name) }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" checked={selectedIds.has(row.id)} onChange={()=>toggleSelect(row.id)} />
                    </td>
                    {visibleColumns.customer && (<td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{row.customer.company_name}</div>
                        <div className="text-sm text-gray-500">{row.customer.email}</div>
                        <div className="text-sm text-gray-500">{row.customer.phone}</div>
                      </div>
                    </td>)}
                    {visibleColumns.product && (<td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500">{row.type==='product' && row.productId ? `Product ID: ${row.productId}` : row.type==='custom' ? 'Product ID: CUST' : ''}</div>
                      <div className="text-sm text-gray-900">{row.productName}</div>
                      <div className="text-sm text-gray-500">Qty: {row.quantity}</div>
                    </td>)}
                    {visibleColumns.details && (<td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {row.size && <div>Size: {row.size}</div>}
                        {row.material && <div>Material: {row.material}</div>}
                        {row.delivery_date && (<div>Delivery: {formatDate(row.delivery_date)}</div>)}
                      </div>
                      {row.comments && (<div className="text-sm text-gray-500 mt-1">{row.comments}</div>)}
                    </td>)}
                    {visibleColumns.invoice && (<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {editingInvoiceId === row.id ? (
                        <input
                          autoFocus
                          className="input-field text-sm w-40"
                          value={editingInvoiceValue}
                          onChange={(e)=> setEditingInvoiceValue(e.target.value)}
                          onBlur={saveInvoice}
                          onKeyDown={(e)=> { if (e.key === 'Enter') saveInvoice(); if (e.key === 'Escape') { setEditingInvoiceId(null); setEditingInvoiceValue('') } }}
                          placeholder="Invoice #"
                        />
                      ) : (
                        <button className="text-left w-40 truncate hover:underline" title={row.invoice_number || ''} onClick={()=> startEditInvoice(row.id, row.invoice_number)}>
                          {row.invoice_number ? row.invoice_number : <span className="text-gray-400">—</span>}
                        </button>
                      )}
                    </td>)}
                    {visibleColumns.images && (<td className="px-6 py-4 align-top">
                      {Array.isArray(row.images) && row.images.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {row.images.slice(0, 3).map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt="ref" className="h-12 w-12 object-cover rounded border" />
                            </a>
                          ))}
                          {row.images.length > 3 && (
                            <span className="text-xs text-gray-500">+{row.images.length - 3} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">No custom image for this order</span>
                      )}
                    </td>)}
                    {visibleColumns.status && (<td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
                        {getStatusIcon(row.status)}
                        <span className="ml-1">{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</span>
                      </span>
                    </td>)}
                    {visibleColumns.datetime && (<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(row.created_at)}
                    </td>)}
                    {visibleColumns.actions && (<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="btn-primary text-xs" disabled={row.type !== 'product'} onClick={()=> row.type==='product' && handleReply((enquiries.find(e=>e.id===row.id) as any) || null)}>Reply</button>
                        <select className="input-field text-xs" value="" onChange={(e)=>{const v=e.target.value; if(!v) return; if(v==='delete') handleDeleteUnified(row.id); else handleStatusChangeUnified(row.id, v); e.currentTarget.selectedIndex=0}}>
                          <option value="">Set status…</option>
                          {STATUS_OPTIONS.map(s => (<option key={s} value={s}>{s}</option>))}
                          <option value="delete">Delete</option>
                        </select>
                      </div>
                    </td>)}
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

        {/* Custom Orders Table */}
        <div className="card mt-6">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Custom Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer/Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 border-l-4" style={{ borderLeftColor: getCompanyColor(order.customer?.company_name || '') }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customer?.company_name}</div>
                        <div className="text-sm text-gray-500">{order.customer?.email}</div>
                        <div className="text-sm text-gray-500">{order.customer?.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.name}</div>
                      <div className="text-sm text-gray-500">Qty: {order.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.size && <div>Size: {order.size}</div>}
                        {order.material && <div>Material: {order.material}</div>}
                        {order.delivery_date && (<div>Delivery: {formatDate(order.delivery_date)}</div>)}
                      </div>
                      {order.comments && (<div className="text-sm text-gray-500 mt-1">{order.comments}</div>)}
                    </td>
                    <td className="px-6 py-4 align-top">
                      {Array.isArray(order.images) && order.images.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {order.images.slice(0, 3).map((url: string, idx: number) => (
                            <a key={idx} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt="ref" className="h-12 w-12 object-cover rounded border" />
                            </a>
                          ))}
                          {order.images.length > 3 && (
                            <span className="text-xs text-gray-500">+{order.images.length - 3} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">No custom image for this order</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCustomOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">No custom orders found</div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attach Images (optional)</label>
                  <div className="mt-2">
                    {/* @ts-ignore */}
                    <ImageUpload multiple onUploadSuccess={(url: string) => setReplyData(prev => ({ ...prev, images: [...prev.images, url] }))} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Comment (optional)</label>
                  <textarea className="input-field" rows={3} value={replyData.comment} onChange={(e)=> setReplyData(prev => ({ ...prev, comment: e.target.value }))} />
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
              {submittingReply && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-md">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Sending...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reply Modal */}
      {showBulkReply && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reply to Selected Enquiries</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                  <select className="input-field" value={bulkTemplateId} onChange={(e)=> setBulkTemplateId(e.target.value)}>
                    <option value="">Select template</option>
                    {templates.map(t => (<option key={t.id} value={t.id}>{t.title}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Set Status</label>
                  <select className="input-field" value={bulkStatus} onChange={(e)=> setBulkStatus(e.target.value)}>
                    <option value="">replied (default)</option>
                    {STATUS_OPTIONS.map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Images (optional)</label>
                {/* @ts-ignore */}
                <ImageUpload multiple onUploadSuccess={(url: string) => setBulkReplyData(prev => ({ ...prev, images: [...prev.images, url] }))} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Comment (optional)</label>
                <textarea className="input-field" rows={3} value={bulkReplyData.comment} onChange={(e)=> setBulkReplyData(prev => ({ ...prev, comment: e.target.value }))} />
              </div>
              <div className="flex space-x-3 pt-2">
                <button className="btn-primary flex-1" onClick={submitBulkReply}>Send Replies</button>
                <button className="btn-secondary flex-1" onClick={()=> setShowBulkReply(false)}>Cancel</button>
              </div>
              {submittingReply && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-md">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Sending...</p>
                  </div>
                </div>
              )}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select className="input-field" value={manualEnquiryData.type} onChange={(e)=> setManualEnquiryData(prev => ({...prev, type: e.target.value as any }))}>
                      <option value="product">Regular Product</option>
                      <option value="custom">Custom Order</option>
                    </select>
                  </div>
                </div>

                {manualEnquiryData.type === 'product' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
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
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Item Name *</label>
                    <input className="input-field" value={manualEnquiryData.name} onChange={(e)=> setManualEnquiryData(prev => ({...prev, name: e.target.value }))} placeholder="Enter item name" />
                  </div>
                )}

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
                  <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mt-2">We will proceed order dispatch after purchase order only</p>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images ({manualEnquiryData.type === 'custom' ? 'required' : 'optional'})</label>
                  <div className="mt-2">
                    {/* @ts-ignore */}
                    <ImageUpload multiple required={manualEnquiryData.type === 'custom'} maxFiles={manualEnquiryData.type === 'custom' ? 3 : 5} onUploadSuccess={(url: string) => setManualEnquiryData(prev => ({ ...prev, images: [...prev.images, url] }))} />
                  </div>
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
