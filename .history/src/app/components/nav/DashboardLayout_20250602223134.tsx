"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../../supabaseClient"
import StudentNavbar from "./StudentNavbar"
import EntrepriseNavbar from "./EntrepriseNavbar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return router.push("/connexion")

      const { data } = await supabase
        .from("utilisateurs")
        .select("role")
        .eq("email", session.user.email)
        .single()

      if (!data) return router.push("/connexion")
      setRole(data.role)
    }

    fetchUser()
  }, [router])

  if (role === null) return null // ou un loader

  return (
    <div className="flex">
      {role === 1 && <StudentNavbar />}
      {role === 2 && <EntrepriseNavbar />}
      <main className="ml-72 w-full">{children}</main>
    </div>
  )
}
