'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ImageUpload({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      if (file.size > 5000000) {
        toast.error('File size must be less than 5MB')
        return
      }
      
      // Create preview
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fileInput = e.currentTarget.elements.namedItem('image') as HTMLInputElement
    const file = fileInput.files?.[0]
    if (!file) return

    setUploading(true)
    
    // Use single FormData instance
    const uploadFormData = new FormData()
    uploadFormData.append('image', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })
      
      const result = await response.json()
      if (response.ok) {
        toast.success('Image uploaded successfully!')
        onUploadSuccess(result.url)
        setPreview(null)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <div>
        <label htmlFor="image" className="block text-sm font-medium mb-2">
          Upload Image
        </label>
        <input 
          name="image" 
          id="image"
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      
      {preview && (
        <div className="mt-4">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-32 h-32 object-cover rounded-lg shadow-md" 
          />
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={uploading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
    </form>
  )
}
