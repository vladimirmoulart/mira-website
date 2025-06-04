"use client"

import { useEffect, useState, useRef } from "react"
import DashboardLayout from "@/app/components/nav/DashboardLayout"
import { supabase } from "../../../../lib/supabaseClient"
import ModalNouveauPost from "../../components/ModalNouveauPost"
import ModalProfil from "../../components/ModalProfil"
import { Plus, Calendar, Building2, GraduationCap, Loader2, User } from "lucide-react"

interface UserType {
  id: string
  nom: string
  avatar?: string
  role: number
}

interface Post {
  id: string
  titre: string
  contenu: string
  created_at: string
  utilisateurs: UserType
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*, utilisateurs(*)")
        .order("created_at", { ascending: false })
        .limit(40)

      if (error) {
        console.error("Erreur chargement posts:", error)
      } else {
        setPosts(data || [])
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()

    const channel = supabase
      .channel("posts-listen")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        async () => {
          await fetchPosts()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (posts.length > 0) {
      feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [posts])

  const getRoleInfo = (role: number) => {
    switch (role) {
      case 1:
        return { label: "Freelance", color: "bg-[#ffbb88]", icon: User }
      case 2:
        return { label: "Entreprise", color: "bg-[#52c1ff]", icon: Building2 }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
        <div className="min-h-screen">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Chargement du fil d'actualité...</p>
            </div>
          </div>
        </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen  from-slate-50 via-blue-50 to-indigo-100 pb-20">
        {/* Header moderne avec effet glassmorphism */}
        <header className="sticky top-0 z-10 backdrop-blur-2xl bg-white/30 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  {/* Main icon container */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 relative overflow-hidden">
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {/* Icon */}
                    <div className="relative z-10 text-3xl group-hover:scale-110 transition-transform duration-300">
                      ✨
                    </div>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  {/* Floating particles effect */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-r from-pink-400 to-red-500 rounded-full animate-bounce"></div>
                </div>

                <div className="space-y-2">
                  {/* Main title with enhanced gradient */}
                  <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
                    Fil d'actualité
                  </h1>
                  {/* Subtitle with better styling */}
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                    <h3 className="text-lg font-medium text-gray-600 leading-relaxed">
                      Découvrez les dernières actualités de la communauté 
                    </h3>
                  </div>
                  {/* Optional: Add a subtle animation line */}
                  <div className="w-24 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-60"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {posts.length > 0 ? (
            <div ref={feedRef} className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {posts.map((post, idx) => {
                const roleInfo = getRoleInfo(post.utilisateurs?.role)
                const RoleIcon = roleInfo.icon
                const avatar = post.utilisateurs?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"
                const nom = post.utilisateurs?.nom || "Utilisateur inconnu"
                const date = formatDate(post.created_at)

                return (
                  <div key={post.id || idx} className="break-inside-avoid group">
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-white/20 hover:border-white/40 hover:-translate-y-1">
                      {/* Header du post */}
                      <div
                        className="flex items-center gap-4 mb-6 cursor-pointer group/profile"
                        onClick={() => setSelectedUserId(post.utilisateurs?.id)}
                      >
                        <div className="relative">
                          <img
                            src={avatar || "/placeholder.svg"}
                            alt={nom}
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-lg group-hover/profile:ring-blue-200 transition-all duration-300"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 group-hover/profile:text-[#52c1ff] transition-colors">
                            {nom}
                          </p>
                          <div
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full text-white mt-2 ${roleInfo.color} shadow-lg`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            {roleInfo.label}
                          </div>
                        </div>
                      </div>

                      {/* Contenu du post */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-[#ffbb88] transition-colors">
                          {post.titre}
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-sm">{post.contenu}</p>
                      </div>

                      {/* Footer du post */}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            <span>Posté le {date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune publication</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Soyez le premier à partager quelque chose d'intéressant avec la communauté !
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                Créer le premier post
              </button>
            </div>
          )}
        </div>

        {/* Bouton flottant moderne */}
        {posts.length > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-[#52c1ff] hover:from-blue-700 hover:to-[#52c1ff] text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-30 group"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}
      </div>

      {showModal && <ModalNouveauPost onClose={() => setShowModal(false)} />}
      {selectedUserId && <ModalProfil userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}
  </Navbar>
  )
}
