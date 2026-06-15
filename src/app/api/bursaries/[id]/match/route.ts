import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'// Ensure this helper exists or matches your server-client utils path
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const bursaryId = params.id

    // 1. Get the authenticated student session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch the student's background from your public users or profiles table
    const { data: profile, error: profileError } = await supabase
      .from('users') // Matches your table definition
      .select('*')
      .eq('id', user.id)
      .single()

    // 3. Fetch the target bursary criteria
    const { data: bursary, error: bursaryError } = await supabase
      .from('bursaries')
      .select('*')
      .eq('id', bursaryId)
      .single()

    if (bursaryError || !bursary) {
      return NextResponse.json({ error: 'Bursary not found' }, { status: 404 })
    }

    // Fallback context mock if profile metadata fields aren't completely populated yet
    const studentContext = {
      name: profile?.full_name || 'Student',
      course: profile?.course || 'Bachelor of Business Information Technology (BBIT)',
      institution: profile?.institution || 'Strathmore University',
      year_of_study: profile?.year_of_study || '4th Year',
      skills: profile?.skills || ['Python', 'Machine Learning', 'TypeScript', 'Next.js'],
      county_of_origin: profile?.county_of_origin || 'Nairobi'
    }

    // 4. Construct the prompt for the AI engine
    const prompt = `
      You are an expert academic advisor and scholarship evaluation engine for Kenyan students.
      Your task is to calculate a compatibility match score between a student profile and a bursary's eligibility requirements.

      STUDENT PROFILE:
      - Course: ${studentContext.course}
      - Institution: ${studentContext.institution}
      - Academic Year: ${studentContext.year_of_study}
      - Skills/Focus: ${studentContext.skills.join(', ')}
      - County/Region: ${studentContext.county_of_origin}

      BURSARY CRITERIA:
      - Title: ${bursary.title}
      - Provider: ${bursary.provider}
      - Category: ${bursary.category}
      - Eligibility Rules: ${bursary.eligibility_criteria}

      Analyze the alignment strictly. Provide a final structural JSON response containing:
      1. "score": An integer between 0 and 100.
      2. "verdict": A brief string summary (e.g., "Excellent Match", "Moderate Match", "Low Eligibility").
      3. "strengths": Array of strings pointing out what matches perfectly.
      4. "gaps": Array of strings showing missing qualifications or potential risks.

      Return ONLY raw JSON matching this structure exactly. Do not include conversational markdown blocks or reasoning steps.
    `

    // 5. Call the LLM
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    
    // Clean JSON block string wrappers if appended by mistake
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsedScore = JSON.parse(cleanJson)

    return NextResponse.json(parsedScore)
  } catch (err: any) {
    console.error('AI Match Error:', err)
    return NextResponse.json({ error: 'Internal evaluation failure', details: err.message }, { status: 500 })
  }
}