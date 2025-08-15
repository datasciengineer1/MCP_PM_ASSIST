
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Testing LLM API connection...')
    
    // Validate API key
    const apiKey = process.env.ABACUSAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ABACUSAI_API_KEY not configured' }, { status: 500 })
    }

    // Simple test message
    const messages = [{
      role: 'user',
      content: 'Hello! This is a test message. Please respond with "LLM API is working correctly!"'
    }]

    // Call LLM API
    console.log('Making LLM API request...')
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages,
        max_tokens: 100,
        temperature: 0.1
      }),
    })

    console.log('LLM API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`LLM API Error ${response.status}:`, errorText)
      return NextResponse.json({ 
        error: `LLM API error: ${response.status}`,
        details: errorText
      }, { status: 500 })
    }

    const data = await response.json()
    const responseText = data?.choices?.[0]?.message?.content ?? 'No response generated'
    
    console.log('LLM API response text:', responseText)

    return NextResponse.json({
      success: true,
      message: 'LLM API test successful!',
      response: responseText,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('LLM API test failed:', error)
    return NextResponse.json({ 
      error: 'LLM API test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to test LLM API' })
}
