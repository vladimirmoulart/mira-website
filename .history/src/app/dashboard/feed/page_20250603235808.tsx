"use client"

import { useEffect, useState, useRef } from "react"
import DashboardLayout from "@/app/components/nav/DashboardLayout"
import { supabase } from "../../../../lib/supabaseClient"
import ModalNouveauPost from "../../components/ModalNouveauPost"
import ModalProfil from "../../components/ModalProfil"
import { Plus, Calendar, Building2, Loader2, User } from "lucide-react"

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
      <DashboardLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#52c1ff]" />
            <p className="text-gray-500 text-sm">Chargement</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-70  py-10 px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium text-gray-900">Fil d'actualité</h1>
            <p className="text-gray-500">Découvrez les dernières actualités de la communauté</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {posts.length > 0 ? (
            <div ref={feedRef} className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {posts.map((post, idx) => {
                const roleInfo = getRoleInfo(post.utilisateurs?.role)
                const RoleIcon = roleInfo.icon
                const avatar = post.utilisateurs?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"
                const nom = post.utilisateurs?.nom || "Utilisateur inconnu"
                const date = formatDate(post.created_at)

                return (
                  <div key={post.id || idx} className="break-inside-avoid">
                    <div className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-sm transition-shadow">
                      {/* Header du post */}
                      <div
                        className="flex items-center gap-3 mb-4 cursor-pointer"
                        onClick={() => setSelectedUserId(post.utilisateurs?.id)}
                      >
                        <img
                          src={avatar || "/placeholder.svg"}
                          alt={nom}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 hover:text-[#52c1ff] transition-colors">{nom}</p>
                          <div
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full text-white mt-1 ${roleInfo.color}`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            {roleInfo.label}
                          </div>
                        </div>
                      </div>

                      {/* Contenu du post */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium text-gray-900 leading-tight">{post.titre}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{post.contenu}</p>
                      </div>

                      {/* Footer du post */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune publication</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                Soyez le premier à partager quelque chose d'intéressant avec la communauté !
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-[#52c1ff] hover:bg-[#52c1ff]/90 text-white px-5 py-2 rounded-lg font-medium transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Créer le premier post
              </button>
            </div>
          )}
        </div>

        {/* Bouton flottant */}
        {posts.length > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className="fixed bottom-8 right-8 bg-[#52c1ff] hover:bg-[#52c1ff]/90 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-30"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {showModal && <ModalNouveauPost onClose={() => setShowModal(false)} />}
      {selectedUserId && <ModalProfil userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}
    </DashboardLayout>
  )
}
