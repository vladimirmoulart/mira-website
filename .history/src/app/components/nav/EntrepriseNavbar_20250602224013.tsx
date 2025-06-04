"use client"

import { useEffect, useState, ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"

import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Search,
  UploadCloud,
  Users,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react"

export default function EntrepriseNavbar( { children }: { children: ReactNode}) {
  const [userNom, setUserNom] = useState("Utilisateur")
  const [userAvatar, setUserAvatar] = useState("")
  
  }

  fetchUser()
 [router])


  const navItems = [
    { icon: LayoutDashboard, label: "Fil d'actualité", href: "/dashboard/feed" },
    { icon: Building2, label: "Mes projets", href: "/dashboard/mes-projets", badge: "Entreprise" },
    { icon: UploadCloud, label: "Proposer une mission", href: "/dashboard/proposer-une-mission", badge: "Entreprise" },
    { icon: Users, label: "Trouver un talent", href: "/dashboard/rechercher-un-talent", badge: "Entreprise" },
  ]

  return (
    <div className="flex">
    <aside className="fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-slate-50/95 to-white/95 backdrop-blur-xl border-r border-slate-200/60 shadow-xl z-50 flex flex-col">
      {/* Logo */}
      <div className="p-8 border-b border-slate-200/50">
        <Link href="/" className="flex items-center justify-center group transition-transform duration-200 hover:scale-105">
          <div className="relative">
            <img src="/images/logo-mira.png" alt="Logo MIRA" className="h-14 w-auto drop-shadow-sm" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {navItems
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-200
              text-slate-700 hover:text-slate-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50
              hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]
              ${pathname === item.href ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-semibold shadow-md" : ""}
            `}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-200 group-hover:shadow-md">
                <item.icon className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors duration-200" />
              </div>
              <span className="font-medium text-sm flex-1">{item.label}</span>
            </Link>
          ))}
      </nav>

      {/* Profil */}
      <div className="p-6 border-t border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-white/50">
        <Link
          href="/dashboard/mon-profil"
          className="group flex items-center gap-4 p-5 rounded-3xl bg-gradient-to-r from-white to-slate-50 border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="relative">
            <img
              src={userAvatar || "/placeholder.svg?height=48&width=48"}
              alt="Avatar"
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">{userNom}</p>
            <p className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mt-1">
              {userRole}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200" />
        </Link>

        {/* Déconnexion */}
        <form action="/auth/signout" method="post" className="mt-4">
          <button
            type="submit"
            className="group w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 text-red-600 rounded-2xl border border-red-200/50 hover:from-red-100 hover:to-rose-100 hover:border-red-300/50 transition-all duration-200 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
            <span className="font-medium text-sm">Déconnexion</span>
          </button>
        </form>
      </div>
    </aside>
    <main className="ml-72 w-full">{children}</main>
    </div>
  )
}
