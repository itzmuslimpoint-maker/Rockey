import { createClient } from "@supabase/supabase-js";

export const getSupabase = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials missing - operations requiring DB will fail.");
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};
