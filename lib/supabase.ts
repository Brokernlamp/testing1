import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for admin functions (backend only)
export const createServiceRoleClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin functions')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          category_id: string
          images: string[] | null
          sizes: string[] | null
          materials: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category_id: string
          images?: string[] | null
          sizes?: string[] | null
          materials?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category_id?: string
          images?: string[] | null
          sizes?: string[] | null
          materials?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          company_name: string
          email: string | null
          phone: string | null
          source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          email?: string | null
          phone?: string | null
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          email?: string | null
          phone?: string | null
          source?: string
          created_at?: string
          updated_at?: string
        }
      }
      enquiries: {
        Row: {
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          product_id: string
          size?: string | null
          quantity?: number
          material?: string | null
          delivery_date?: string | null
          comments?: string | null
          status?: string
          reply_template_id?: string | null
          quotation_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          product_id?: string
          size?: string | null
          quantity?: number
          material?: string | null
          delivery_date?: string | null
          comments?: string | null
          status?: string
          reply_template_id?: string | null
          quotation_amount?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          item_name: string
          quantity: number
          threshold: number
          supplier_whatsapp: string | null
          supplier_name: string | null
          unit_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_name: string
          quantity?: number
          threshold?: number
          supplier_whatsapp?: string | null
          supplier_name?: string | null
          unit_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_name?: string
          quantity?: number
          threshold?: number
          supplier_whatsapp?: string | null
          supplier_name?: string | null
          unit_price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      supplier_orders: {
        Row: {
          id: string
          item_id: string
          quantity: number
          supplier_whatsapp: string | null
          template_id: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          quantity: number
          supplier_whatsapp?: string | null
          template_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          quantity?: number
          supplier_whatsapp?: string | null
          template_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          type: string
          category: string | null
          title: string
          content: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          category?: string | null
          title: string
          content: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          category?: string | null
          title?: string
          content?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
