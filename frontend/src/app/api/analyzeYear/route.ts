import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  const { year, rate } = await req.json()

  if (!year || rate === undefined) {
    return NextResponse.json(
      { status: 'error', message: 'Year and rate are required' },
      { status: 400 },
    )
  }

  try {
    const prompt = `
      Analyze the significance of the U.S. average tariff rate for the year ${year}, which was approximately ${rate.toFixed(
      2,
    )}%.

      Provide a concise analysis covering the following points in a structured format:
      - **Historical Context:** What major events, economic conditions, or political sentiment (e.g., protectionism vs. free trade) defined this period in U.S. history?
      - **Key Trade Policies or Acts:** Were there any significant tariff acts (like the Smoot-Hawley Tariff or the Underwood Tariff) or trade agreements passed around this time that would have influenced this rate?
      - **Economic Impact:** Briefly describe the effect of the tariff policies of this era on U.S. industry, consumers, and foreign relations.

      Keep the analysis to a few short paragraphs and use bullet points for clarity where appropriate.
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 400,
    })

    const analysis = response.choices[0].message?.content?.trim()

    return NextResponse.json({ status: 'success', analysis })
  } catch (error) {
    console.error('Error generating analysis:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to generate analysis' },
      { status: 500 },
    )
  }
}
