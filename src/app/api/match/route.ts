import { NextRequest, NextResponse } from 'next/server'

// This is a Next.js API route — it runs on the server
// The client calls this endpoint, this calls Anthropic
// The API key never touches the browser

export async function POST(request: NextRequest) {
  try {
    const { profile, bursary } = await request.json()

    const prompt = `You are a bursary eligibility assistant for Kenyan students.

Given this student profile:
- Level of education: ${profile.level_of_education}
- Institution: ${profile.institution}
- Course of study: ${profile.course_of_study}
- Year of study: ${profile.year_of_study}
- County of origin: ${profile.county_of_origin}
- Monthly household income bracket: ${profile.income_bracket}

And this bursary:
- Title: ${bursary.title}
- Provider: ${bursary.provider}
- Type: ${bursary.type}
- Eligible counties: ${bursary.eligibility_counties?.length > 0 ? bursary.eligibility_counties.join(', ') : 'All counties'}
- Eligible education levels: ${bursary.eligibility_levels?.join(', ')}
- Maximum household income: ${bursary.eligibility_income_max ? `KES ${bursary.eligibility_income_max}/month` : 'No limit'}

Respond with ONLY a JSON object in this exact format, nothing else:
{
  "score": <number between 0 and 100>,
  "eligible": <true or false>,
  "reason": "<one sentence explaining the score>",
  "tip": "<one practical tip to strengthen their application>"
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    
    // Extract text from Anthropic response
    const text = data.content[0].text
    
    // Parse the JSON response from Claude
    const result = JSON.parse(text)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Match API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate match score' },
      { status: 500 }
    )
  }
}