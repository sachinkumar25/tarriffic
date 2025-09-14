import { resolve } from 'path'
import OpenAI from 'openai'
import { promises as fs } from 'fs'
import Papa from 'papaparse'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Service Role Key is missing from .env.local')
}
const supabase = createClient(supabaseUrl, supabaseKey)

const inputFile = resolve(
  process.cwd(),
  'public',
  'us_tariff_history_1821-2025.csv',
)

async function generateAnalysisForYear(year, rate) {
  const prompt = `
      Analyze the significance of the U.S. average tariff rate for the year ${year}, which was approximately ${rate.toFixed(
    2,
  )}%.

      Provide a concise analysis covering the following points in a structured format:
      - **Historical Context:** What major events, economic conditions, or political sentiment (e.g., protectionism vs. free trade) defined this period in U.S. history?
      - **Key Trade Policies or Acts:** Were there any significant tariff acts (like the Smoot-Hawley Tariff or the Underwood Tariff) or trade agreements passed around this time that would have influenced this rate?
      - **Economic Impact:** Briefly describe the effect of the tariff policies of this era on U.S. industry, consumers, and foreign relations.

      Keep the analysis to a few short paragraphs and use bullet points for clarity where appropriate. Format headers with **double asterisks**.
    `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 400,
    })
    return response.choices[0].message?.content?.trim() || 'No analysis generated.'
  } catch (error) {
    console.error(`Error generating analysis for ${year}:`, error)
    return 'Failed to generate analysis.'
  }
}

async function main() {
  console.log('Starting analysis generation and upload to Supabase...')

  const fileContent = await fs.readFile(inputFile, 'utf-8')
  const { data: records } = Papa.parse(fileContent, {
    header: true,
    dynamicTyping: true,
  })

  let count = 0
  const totalRecords = records.filter(r => r.Year && r.Rate).length

  for (const record of records) {
    if (record.Year && record.Rate) {
      console.log(
        `[${++count}/${totalRecords}] Generating analysis for ${record.Year}...`,
      )
      const analysis = await generateAnalysisForYear(record.Year, record.Rate)

      console.log(` -> Uploading ${record.Year} to Supabase...`)
      const { error } = await supabase.from('historical_analysis').upsert({
        year: record.Year,
        rate: record.Rate,
        analysis: analysis,
      })

      if (error) {
        console.error(`Error uploading data for ${record.Year}:`, error)
      }

      // Small delay to avoid hitting API rate limits
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log(`\nAnalysis generation and upload complete!`)
}

main()
