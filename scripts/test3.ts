import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load environment variables manually
const envPath = path.resolve(process.cwd(), ".env.local");
const envVars = fs.readFileSync(envPath, "utf-8").split("\n");
const env: Record<string, string> = {};
for (const line of envVars) {
  const [key, ...values] = line.split("=");
  if (key && values.length > 0) {
    env[key.trim()] = values.join("=").trim().replace(/"/g, "");
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: pages, error: pagesError } = await supabase.from("pages").select("*");
  const { data: blocks, error: blocksError } = await supabase.from("blocks").select("*");
  console.log("Pages:", pages?.length, "Error:", pagesError);
  console.log("Blocks:", blocks?.length, "Error:", blocksError);
}

test();
