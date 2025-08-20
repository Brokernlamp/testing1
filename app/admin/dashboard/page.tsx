'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Users, 
  MessageSquare, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  LogOut,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalCustomers: number
  totalEnquiries: number
  pendingEnquiries: number
  completedEnquiries: number
  lowInventoryItems: number
}

interface RecentEnquiry {
  id: string
  customer: {
    company_name: string
    email: string | null
    phone: string | null
  }
  product: {
    name: string
  }
  size: string | null
  quantity: number
  material: string | null
  delivery_date: string | null
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalEnquiries: 0,
    pendingEnquiries: 0,
    completedEnquiries: 0,
    lowInventoryItems: 0
  })
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      router.push('/admin')
      return
    }

    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const customersCountPromise = supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

      const enquiriesCountPromise = supabase
        .from('enquiries')
        .select('*', { count: 'exact', head: true })

      const pendingCountPromise = supabase
        .from('enquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      const completedCountPromise = supabase
        .from('enquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      // Column-to-column comparison not supported by supabase-js filter; fetch minimal columns and compute
      const lowInventoryPromise = supabase
        .from('inventory')
        .select('quantity,threshold', { count: 'exact' })

      const recentEnquiriesPromise = supabase
        .from('enquiries')
        .select(`
          *,
          customer:customers(company_name, email, phone),
          product:products(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      const [customersCountRes, enquiriesCountRes, pendingCountRes, completedCountRes, lowInventoryRes, recentEnquiriesRes] = await Promise.all([
        customersCountPromise,
        enquiriesCountPromise,
        pendingCountPromise,
        completedCountPromise,
        lowInventoryPromise,
        recentEnquiriesPromise
      ])

      const lowInventoryItems = (lowInventoryRes.data || []).filter((row: any) => (row.quantity ?? 0) < (row.threshold ?? 0)).length

      setStats({
        totalCustomers: customersCountRes.count || 0,
        totalEnquiries: enquiriesCountRes.count || 0,
        pendingEnquiries: pendingCountRes.count || 0,
        completedEnquiries: completedCountRes.count || 0,
        lowInventoryItems
      })

      setRecentEnquiries(recentEnquiriesRes.data || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated')
    localStorage.removeItem('adminUser')
    router.push('/admin')
    toast.success('Logged out successfully')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'replied':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Business Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <a href="/admin/dashboard" className="text-primary-600 border-b-2 border-primary-600 pb-2 font-medium">
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
            <a href="/admin/templates" className="text-gray-500 hover:text-primary-600 font-medium">
              Templates
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Enquiries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEnquiries}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingEnquiries}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedEnquiries}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowInventoryItems}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Enquiries Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Enquiries</h2>
            <a href="/admin/enquiries" className="btn-primary flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>View All</span>
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
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
                {recentEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {enquiry.customer.company_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {enquiry.customer.email}
                        </div>
                        {enquiry.customer.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {enquiry.customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{enquiry.product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Size: {enquiry.size || 'Custom'}</div>
                        <div>Qty: {enquiry.quantity}</div>
                        <div>Material: {enquiry.material || 'Custom'}</div>
                        {enquiry.delivery_date && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(enquiry.delivery_date)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(enquiry.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {recentEnquiries.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No enquiries found</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="grid md:grid-cols-2 gap-6 mt-8"
        >
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a href="/admin/products" className="btn-primary w-full flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </a>
              <a href="/admin/enquiries" className="btn-secondary w-full flex items-center justify-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Create Manual Enquiry</span>
              </a>
              <a href="/admin/inventory" className="btn-secondary w-full flex items-center justify-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Manage Inventory</span>
              </a>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Connection</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Sync</span>
                <span className="text-sm text-gray-900">{formatDate(new Date())}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm text-gray-900">1</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
