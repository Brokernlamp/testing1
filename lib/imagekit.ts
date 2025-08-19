import ImageKit from 'imagekit'

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
})

// Function to upload image to ImageKit
export const uploadImageToImageKit = async (file: File): Promise<string> => {
  try {
    console.log('Starting ImageKit upload for file:', file.name)
    console.log('ImageKit config:', {
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ? 'Set' : 'Not set',
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY ? 'Set' : 'Not set',
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ? 'Set' : 'Not set'
    })
    
    // Convert file to base64
    const base64 = await fileToBase64(file)
    console.log('File converted to base64, length:', base64.length)
    
    // Upload to ImageKit
    const result = await imagekit.upload({
      file: base64,
      fileName: `product_${Date.now()}_${file.name}`,
      folder: 'products',
      useUniqueFileName: true,
      responseFields: ['url']
    })
    
    console.log('ImageKit upload result:', result)
    return result.url
  } catch (error) {
    console.error('Error uploading to ImageKit:', error)
    throw new Error('Failed to upload image')
  }
}

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result as string
      // Remove data:image/jpeg;base64, prefix
      const base64Data = base64.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = error => reject(error)
  })
}

// Function to get optimized image URL
export const getOptimizedImageUrl = (originalUrl: string, width: number = 400, height: number = 400): string => {
  if (!originalUrl) return ''
  
  // Add ImageKit transformation parameters
  const params = `tr=w-${width},h-${height},c-at_max`
  const separator = originalUrl.includes('?') ? '&' : '?'
  
  return `${originalUrl}${separator}${params}`
}

// Function to delete image from ImageKit
export const deleteImageFromImageKit = async (fileId: string): Promise<void> => {
  try {
    await imagekit.deleteFile(fileId)
  } catch (error) {
    console.error('Error deleting from ImageKit:', error)
    throw new Error('Failed to delete image')
  }
}
