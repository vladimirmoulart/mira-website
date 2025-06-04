// lib/supabaseServer.ts
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

export function createServerSupabaseClient() {
  return createServerComponentClient<Database>({ cookies })
}
