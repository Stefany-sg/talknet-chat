import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://fwlomxmxsemsmujnrzpe.supabase.co"
const supabaseKey = "sb_publishable_nR-m2rMzddehLWX3_EGO1Q_E0Bgvk2_"

// IMPORTANTE: Fíjate que dice "export const", NO "export default"
export const supabase = createClient(supabaseUrl, supabaseKey)