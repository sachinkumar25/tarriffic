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
      .single();

    if (error || !data) {
      console.log("No pre-stored analysis found, using fallback:", error?.message || "No data");
      
      // Fallback: Create a user-friendly analysis if not found in database
      const fallbackAnalysis = `**What This Trade Route Means**

**Why This Matters:**
The United States and ${flow.partner} have a major trading relationship worth $${(flow.trade_value / 1e9).toFixed(1)} billion annually. This trade supports jobs, provides consumers with goods, and generates government revenue.

**The Import Tax (Tariff):**
• The U.S. charges a ${flow.tariff_rate?.toFixed(1) || 'N/A'}% tax on these imports
• This adds about $${(flow.tariff_revenue / 1e9).toFixed(2)} billion to government revenue each year
• The tax helps protect American businesses but makes imports more expensive

**Impact on You:**
• Higher import taxes can mean higher prices for consumers
• American companies in similar industries get protection from foreign competition
• The government uses this tax revenue for public services and programs

**The Bigger Picture:**
This trade relationship is part of America's broader economic strategy. Tariffs balance protecting domestic industries with maintaining beneficial trade relationships that provide consumers with diverse, affordable products.`;

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
