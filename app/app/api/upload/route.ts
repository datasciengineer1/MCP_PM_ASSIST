
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as XLSX from 'xlsx'
import mammoth from 'mammoth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `/uploads/${fileName}`

    // Create file upload record
    const fileUpload = await prisma.fileUpload.create({
      data: {
        fileName,
        originalName: file.name,
        filePath,
        fileSize: file.size,
        mimeType: file.type,
        projectId: projectId || null,
        status: 'PROCESSING'
      }
    })

    // Process file based on type
    let processedData = null
    let errorMessage = null

    try {
      if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        processedData = await processExcelFile(buffer)
      } else if (file.type.includes('document') || file.name.endsWith('.docx')) {
        processedData = await processWordFile(buffer)
      } else if (file.type.includes('text') || file.name.endsWith('.txt')) {
        processedData = await processTextFile(buffer)
      } else if (file.name.endsWith('.csv')) {
        processedData = await processCsvFile(buffer)
      } else {
        // For other files, try to extract as text
        const text = Buffer.from(buffer).toString('utf8')
        processedData = { content: text, type: 'raw_text' }
      }

      // Update file upload with processed data
      await prisma.fileUpload.update({
        where: { id: fileUpload.id },
        data: {
          status: 'PROCESSED',
          processedData
        }
      })

    } catch (processingError) {
      errorMessage = processingError instanceof Error ? processingError.message : 'File processing failed'
      
      await prisma.fileUpload.update({
        where: { id: fileUpload.id },
        data: {
          status: 'ERROR',
          errorMessage
        }
      })
    }

    return NextResponse.json({
      success: true,
      fileId: fileUpload.id,
      fileName: fileUpload.fileName,
      status: errorMessage ? 'ERROR' : 'PROCESSED',
      processedData,
      error: errorMessage
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    )
  }
}

async function processExcelFile(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const result: any = {
    type: 'excel',
    sheets: {},
    summary: {
      totalSheets: workbook.SheetNames.length,
      sheetNames: workbook.SheetNames
    }
  }

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    result.sheets[sheetName] = {
      data: jsonData,
      rowCount: (jsonData as any[]).length,
      columnCount: (jsonData as any[])[0]?.length ?? 0
    }
  }

  return result
}

async function processWordFile(buffer: ArrayBuffer) {
  try {
    const nodeBuffer = Buffer.from(buffer)
    const result = await mammoth.extractRawText({ buffer: nodeBuffer })
    
    return {
      type: 'document',
      content: result.value,
      wordCount: result.value.split(/\s+/).length,
      messages: result.messages
    }
  } catch (error) {
    // Fallback to ArrayBuffer if Node.js Buffer fails
    const result = await mammoth.extractRawText({ buffer: buffer as any })
    
    return {
      type: 'document',
      content: result.value,
      wordCount: result.value.split(/\s+/).length,
      messages: result.messages
    }
  }
}

async function processTextFile(buffer: ArrayBuffer) {
  const text = Buffer.from(buffer).toString('utf8')
  
  return {
    type: 'text',
    content: text,
    wordCount: text.split(/\s+/).length,
    lineCount: text.split('\n').length
  }
}

async function processCsvFile(buffer: ArrayBuffer) {
  const text = Buffer.from(buffer).toString('utf8')
  const lines = text.split('\n')
  const data = lines.map(line => line.split(','))
  
  return {
    type: 'csv',
    data,
    rowCount: data.length,
    columnCount: data[0]?.length ?? 0,
    headers: data[0] ?? []
  }
}

// API to get uploaded files
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const projectId = url.searchParams.get('projectId')

    const where = projectId ? { projectId } : {}
    
    const uploads = await prisma.fileUpload.findMany({
      where,
      orderBy: { uploadedAt: 'desc' }
    })

    return NextResponse.json(uploads)
  } catch (error) {
    console.error('Uploads GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch uploads' },
      { status: 500 }
    )
  }
}
