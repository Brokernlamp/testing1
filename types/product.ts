export interface Product {
  id: string
  name: string
  description: string | null
  category_id: string
  images: string[] | null
  image_url: string | null
  sizes: string[] | null
  materials: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
  category: {
    name: string
  }
}

