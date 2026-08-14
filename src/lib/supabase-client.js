import { createClient } from "@supabase/supabase-js";
 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 
let client;
 
export const supabaseClient = () => {
  if (!client) {
    client = createClient(supabaseUrl, supabaseKey);
  }
  return client;
};