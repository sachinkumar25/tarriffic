// Test script to check Supabase connection and table existence
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSupabase() {
  try {
    console.log('\n1. Testing basic connection...')
    const { data, error } = await supabase.from('historical_analyses').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Error connecting to historical_analyses table:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
    } else {
      console.log('Success! Table exists with', data?.length || 0, 'records')
    }

    console.log('\n2. Testing table schema...')
    const { data: schemaData, error: schemaError } = await supabase
      .from('historical_analyses')
      .select('*')
      .limit(1)
    
    if (schemaError) {
      console.error('Schema error:', schemaError)
    } else {
      console.log('Sample record:', schemaData?.[0] || 'No records found')
    }

    console.log('\n3. Listing all tables...')
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables')
    
    if (tablesError) {
      console.log('Cannot list tables (expected if RPC not available):', tablesError.message)
    } else {
      console.log('Available tables:', tables)
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testSupabase()
