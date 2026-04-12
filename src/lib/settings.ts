import { supabase } from "./supabase";

/**
 * Fetch all settings as a key-value map.
 * Works in both server and client components.
 */
export async function getSettings(): Promise<Record<string, string>> {
  const { data } = await supabase.from("settings").select("*");
  if (!data) return {};
  return data.reduce((acc: Record<string, string>, row: any) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

/**
 * Fetch a single setting value by key.
 */
export async function getSetting(key: string): Promise<string> {
  const { data } = await supabase.from("settings").select("value").eq("key", key).single();
  return data?.value || "";
}
