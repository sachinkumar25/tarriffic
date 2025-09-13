import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Setup OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { flow } = await request.json();

    if (!flow) {
      return NextResponse.json({ error: "Missing flow data" }, { status: 400 });
    }

    // Create the structured prompt
    const prompt = `
    You are an expert trade economist. Analyze this bilateral tariff flow:

    Reporter: ${flow.reporter}
    Partner: ${flow.partner}
    Product: ${flow.product} (HS4 ${flow.hs4})
    Year: ${flow.year}
    Trade Value: $${flow.trade_value.toLocaleString()}
    Tariff: ${flow.tariff_rate}%
    Estimated Tariff Revenue: $${flow.tariff_revenue.toLocaleString()}

    Task:
    - Explain why this tariff exists (historical, political, or economic reasons).
    - Describe its macroeconomic impact (prices, trade balance, supply chains).
    - Connect to broader trends (trade wars, inflation, globalization).
    - Keep it concise, clear, and engaging.
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert trade economist." },
        { role: "user", content: prompt }
      ],
      max_tokens: 400,
    });

    return NextResponse.json({
      status: "success",
      analysis: completion.choices[0].message?.content,
    });

  } catch (err: unknown) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Failed to analyze flow" }, { status: 500 });
  }
}
