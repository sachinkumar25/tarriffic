import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our stored trade analysis data
export interface TradeAnalysis {
  id?: number
  reporter: string
  partner: string
  product: string
  hs4: string
  year: number
  trade_value: number
  tariff_rate: number
  tariff_revenue: number
  analysis: string
  created_at?: string
}

// Types for historical tariff analysis data (1821-2025)
export interface HistoricalAnalysis {
  id?: number
  year: number
  rate: number
  analysis: string
  created_at?: string
}
