import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { flow } = await request.json();

    if (!flow) {
      return NextResponse.json({ error: "Missing flow data" }, { status: 400 });
    }

    // Query Supabase for pre-stored analysis based on flow data
    const { data, error } = await supabase
      .from('trade_analyses')
      .select('analysis')
      .eq('reporter', flow.reporter)
      .eq('partner', flow.partner)
      .eq('hs4', flow.hs4)
      .eq('year', flow.year)
      .single();

    if (error || !data) {
      console.log("No pre-stored analysis found, using fallback:", error?.message || "No data");
      
      // Fallback: Create a basic analysis if not found in database
      const fallbackAnalysis = `**Trade Analysis: ${flow.reporter} ↔ ${flow.partner}**

**Product:** ${flow.product} (HS4 Code: ${flow.hs4})
**Year:** ${flow.year}

**Key Metrics:**
• Trade Value: $${flow.trade_value?.toLocaleString() || 'N/A'}
• Tariff Rate: ${flow.tariff_rate || 'N/A'}%
• Estimated Tariff Revenue: $${flow.tariff_revenue?.toLocaleString() || 'N/A'}

**Economic Impact:**
This trade relationship represents a significant bilateral commerce flow with important tariff implications. The ${flow.tariff_rate || 'applied'}% tariff rate affects pricing, competitiveness, and supply chain decisions for businesses in both countries.

**Trade Policy Context:**
Tariffs on this product category reflect broader trade policy objectives including domestic industry protection, revenue generation, and strategic economic positioning in global markets.`;

      return NextResponse.json({
        status: "success",
        analysis: fallbackAnalysis,
        source: "fallback"
      });
    }

    return NextResponse.json({
      status: "success",
      analysis: data.analysis,
      source: "supabase"
    });

  } catch (err: unknown) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Failed to analyze flow" }, { status: 500 });
  }
}
