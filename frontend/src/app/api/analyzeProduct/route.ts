import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { hs4, name, value, tariff } = await req.json();

    if (!hs4 || !name || value === undefined || tariff === undefined) {
      return NextResponse.json({ error: 'Missing required product data' }, { status: 400 });
    }

    const prompt = `
      You are an expert economic analyst specializing in international trade and tariffs.
      Given the following product and trade data for a transaction from the USA to the rest of the world:
      - Product Name: ${name} (HS Code: ${hs4})
      - Tariff Rate: ${tariff.toFixed(2)}%
      - Annual Trade Value: $${(value / 1e9).toFixed(2)} Billion

      Please provide a concise analysis, enclosed within <analysis> tags, that explains the following:
      1. Briefly explain the likely reasons for tariffs in this specific sector (e.g., protecting domestic industry, health and safety, political leverage).
      2. Describe the potential macroeconomic effects of these tariffs (e.g., impact on consumer prices, supply chain disruptions, potential for trade disputes).
      3. Conclude with a simple, one-sentence takeaway for a non-expert that summarizes the core impact.

      Keep the entire analysis to under 100 words.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.3,
    });

    const analysisText = response.choices[0].message?.content;
    
    if (!analysisText) {
      throw new Error('No content received from AI model.');
    }

    const analysisMatch = analysisText.match(/<analysis>([\s\S]*?)<\/analysis>/);
    const extractedAnalysis = analysisMatch ? analysisMatch[1].trim() : "Analysis could not be extracted.";

    return NextResponse.json({ analysis: extractedAnalysis });

  } catch (error) {
    console.error('Error analyzing product:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to analyze product', details: errorMessage }, { status: 500 });
  }
}
