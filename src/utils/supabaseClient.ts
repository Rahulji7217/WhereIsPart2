import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bnvsuhufekgixvifsdkc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudnN1aHVmZWtnaXh2aWZzZGtjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM1NDkwMSwiZXhwIjoyMDY1OTMwOTAxfQ.kgQ8vxRE0f_NnE_UlzCV9TkovWJEBwJtEBwUrZctPRs'

export const supabase = createClient(supabaseUrl, supabaseKey)