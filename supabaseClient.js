import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Debugging: Check if values exist
console.log("Backend Supabase URL:", supabaseUrl);
console.log("Backend Supabase Key:", supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing in backend! Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
