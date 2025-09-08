'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Save, X, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Customer {
  id: string
  company_name: string
  email: string | null
  phone: string | null
  created_at: string
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState<{ company_name: string; email: string; phone: string }>({ company_name: '', email: '', phone: '' })
  const [search, setSearch] = useState('')

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      router.push('/admin')
      return
    }
    load()
  }, [router])

  const load = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('customers').select('id, company_name, email, phone, created_at').order('company_name')
      if (error) throw error
      setCustomers(data || [])
    } catch (e) {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => { setShowForm(false); setEditing(null); setForm({ company_name: '', email: '', phone: '' }) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company_name.trim()) { toast.error('Company name is required'); return }
    try {
      if (editing) {
        const { error } = await supabase.from('customers').update({ company_name: form.company_name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null }).eq('id', editing.id)
        if (error) throw error
        toast.success('Customer updated')
      } else {
        const { error } = await supabase.from('customers').insert({ company_name: form.company_name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null, source: 'admin' })
        if (error) throw error
        toast.success('Customer created')
      }
      resetForm()
      load()
    } catch (e:any) {
      toast.error(e?.message || 'Save failed')
    }
  }

  const startEdit = (c: Customer) => { setEditing(c); setForm({ company_name: c.company_name, email: c.email || '', phone: c.phone || '' }); setShowForm(true) }

  const del = async (id: string) => {
    if (!confirm('Delete this customer?')) return
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id)
      if (error) throw error
      toast.success('Customer deleted')
      load()
    } catch (e) { toast.error('Delete failed') }
  }

  const filtered = customers.filter(c => c.company_name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div>Loading...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SKS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                <p className="text-sm text-gray-600">Manage company names for orders</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <a href="/admin/dashboard" className="text-gray-500 hover:text-primary-600 font-medium">Dashboard</a>
            <a href="/admin/products" className="text-gray-500 hover:text-primary-600 font-medium">Products</a>
            <a href="/admin/customers" className="text-primary-600 border-b-2 border-primary-600 pb-2 font-medium">Customers</a>
            <a href="/admin/enquiries" className="text-gray-500 hover:text-primary-600 font-medium">Enquiries</a>
            <a href="/admin/inventory" className="text-gray-500 hover:text-primary-600 font-medium">Inventory</a>
            <a href="/admin/templates" className="text-gray-500 hover:text-primary-600 font-medium">Templates</a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Company List</h2>
            </div>
            <div className="flex gap-2">
              <input className="input-field" placeholder="Search companies..." value={search} onChange={(e)=>setSearch(e.target.value)} />
              <button className="btn-primary" onClick={()=>{ setShowForm(true); setEditing(null); setForm({ company_name:'', email:'', phone:'' }) }}><Plus className="w-4 h-4 inline" /> Add</button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{editing ? 'Edit Company' : 'Add Company'}</h3>
              <button className="text-gray-400" onClick={resetForm}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={submit} className="grid md:grid-cols-3 gap-3">
              <input className="input-field" placeholder="Company name *" value={form.company_name} onChange={(e)=>setForm(prev=>({...prev, company_name: e.target.value}))} required />
              <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm(prev=>({...prev, email: e.target.value}))} />
              <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e)=>setForm(prev=>({...prev, phone: e.target.value}))} />
              <div className="md:col-span-3 flex gap-2">
                <button type="submit" className="btn-primary"><Save className="w-4 h-4 inline" /> Save</button>
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">{c.company_name}</td>
                  <td className="px-6 py-3">{c.email}</td>
                  <td className="px-6 py-3">{c.phone}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button className="btn-secondary text-xs" onClick={()=>startEdit(c)}><Edit className="w-4 h-4 inline" /> Edit</button>
                      <button className="btn-secondary text-xs" onClick={()=>del(c.id)}><Trash2 className="w-4 h-4 inline" /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="px-6 py-6 text-gray-500" colSpan={4}>No companies found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


