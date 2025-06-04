// app/dashboard/layout.tsx

import { createServerSupabaseClient } from "@/lib/supabaseServer"
import Navbar from "@/app/components/Navbar"
import { ReactNode } from "react"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/connexion")
  }

  return (
    <>
      <Navbar /> {/* ici, une version client par exemple */}
      <main className="ml-72">{children}</main>
    </>
  )
}
