'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void
}

export default function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0]
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
    const formData = new FormData(e.currentTarget)
    const file = formData.get('image') as File
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
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
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload}>
      <input 
        name="image" 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        className="file-input"
      />
      {preview && <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border mt-2" />}
      <button type="submit" disabled={uploading} className="upload-button">
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  )
}
