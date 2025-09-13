import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
