"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"

import { LayoutDashboard, Briefcase, Search, LogOut, ChevronRight } from "lucide-react"

export default function EtudiantNavbar({ children }: { children: ReactNode }) {
  const [userNom, setUserNom] = useState("Utilisateur")
  const [userAvatar, setUserAvatar] = useState("")
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session || !session.user) {
        router.push("/connexion")
        return
      }

      const user = session.user

      const { data } = await supabase.from("utilisateurs").select("nom, role, avatar").eq("email", user.email).single()

      setUserNom(data?.nom || "Utilisateur")
      setUserAvatar(data?.avatar || "")
    }

    fetchUser()
  }, [router])

  const navItems = [
    { icon: LayoutDashboard, label: "Fil d'actualité", href: "/dashboard/feed" },
    { icon: Briefcase, label: "Mes missions", href: "/dashboard/mes-missions" },
    { icon: Search, label: "Trouver une mission", href: "/dashboard/rechercher-une-mission" },
  ]

  return (
    <div className="flex">
      <aside className="fixed top-0 left-0 h-screen w-64 shadow-md bg-white z-50 flex flex-col"> {/* bordure */}
        {/* Logo */}
        <div className="p-6 "> {/* bordure */}
          <Link href="/" className="flex items-center justify-center">
            <img src="/images/logo-mira.png" alt="Logo MIRA" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 p-3 rounded-lg transition-all duration-200
              text-gray-700 hover:text-gray-900 hover:bg-gray-50
              ${pathname === item.href ? "bg-[#52c1ff] text-white" : ""}
            `}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                  pathname === item.href ? "bg-white/20" : "bg-gray-100"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 transition-colors duration-200 ${
                    pathname === item.href ? "text-white" : "text-gray-600"
                  }`}
                />
              </div>
              <span className="font-medium text-sm flex-1">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Profil */}
        <div className="p-4 "> {/* Bordure */}
          <Link
            href="/dashboard/mon-profil"
            className="group flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200"
          >
            <div className="relative">
              <img
                src={userAvatar || "/placeholder.svg?height=40&width=40"}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate text-sm">{userNom}</p>
              <p className="text-xs text-[#ffbb88] font-medium">Freelance</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
          </Link>

          {/* Déconnexion */}
          <div className="mt-3">
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push("/connexion")
              }}
              className="group w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium text-sm">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
      <main >{children}</main>
    </div>
  )
}
