// lib/supabaseServer.ts
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { type Database } from "./types/supabase" // si tu as typé ta base

export function createServerSupabaseClient() {
  return createServerComponentClient<Database>({ cookies })
}
