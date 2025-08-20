import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuid } from 'uuid'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuid()}.${fileExtension}`
    
    // Save to public/uploads (temporary storage)
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadDir, fileName)
    
    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      // Create directory if it doesn't exist
      const { mkdir } = await import('fs/promises')
      await mkdir(uploadDir, { recursive: true })
      await writeFile(filePath, buffer)
    }

    // Return the public URL (this will be replaced with ImageKit URL in production)
    const publicUrl = `/uploads/${fileName}`
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileId: fileName,
      name: file.name
    })
  } catch (error: any) {
    console.error('ImageKit upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
