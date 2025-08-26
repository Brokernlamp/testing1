import { NextRequest, NextResponse } from 'next/server'
import imagekit from '@/lib/imagekit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    console.log(`📁 Uploading file: ${file.name} (${file.size} bytes)`)

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: base64,
      fileName: `product_${Date.now()}_${file.name}`,
      folder: 'products',
      useUniqueFileName: true,
      responseFields: ['url', 'fileId', 'name']
    })

    console.log('✅ Upload successful:', result.url)

    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      name: result.name
    })

  } catch (error: any) {
    console.error('❌ Upload error:', error)
    
    let errorMessage = 'Upload failed'
    if (error.message) {
      if (error.message.includes('authorization')) {
        errorMessage = 'Your request is missing authorization parameters. Check your API keys.'
      } else if (error.message.includes('authenticated')) {
        errorMessage = 'Your account cannot be authenticated. Verify your API keys.'
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
