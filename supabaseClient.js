import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Debugging: Check if environment variables are loaded
console.log("Backend Supabase URL:", process.env.SUPABASE_URL);
console.log("Backend Supabase Key:", process.env.SUPABASE_ANON_KEY);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Ensure environment variables exist
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing in the backend!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
