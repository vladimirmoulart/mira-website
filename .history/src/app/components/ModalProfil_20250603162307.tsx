"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"


import {
  Users,
  Star,
  Briefcase,
  X,
  ExternalLink,
  Mail,
  Calendar,
  MapPin,
  Award,
  Loader2,
  LinkIcon,
  UserPlus,
  UserMinus,
  User,
} from "lucide-react"
import { FaLinkedin } from "react-icons/fa"

import { ModalAvis } from "./ModalAvis"
import { ModalAbonnes } from "./ModalAbonnes"
import { ModalAbonnements } from "./ModalAbonnements"
import { ModalMissions } from "./ModalMissions"



interface UserProfile {
  id: string
  nom: string
  email?: string
  role: number
  avatar?: string
  abonnésCount?: number
  abonnementsCount?: number
  note?: number
  missions_realisees?: number
  linkedin?: string
  portfolio?: string
  localisation?: string
  experience?: string
  disponibilite?: string
}

interface Post {
  id: string
  titre: string
  contenu: string
  created_at: string
}

export default function ModalProfil({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)

  const [showAbonnementsModal, setShowAbonnementsModal] = useState(false)
  const [showAbonnesModal, setShowAbonnesModal] = useState(false)
  const [showAvisModal, setShowAvisModal] = useState(false)
  const [showMissionsModal, setShowMissionsModal] = useState(false)


  const fetchData = async () => {
    try {
      const {
        data: { user: sessionUser },
      } = await supabase.auth.getUser()
      if (!sessionUser) return

      setSessionUserId(sessionUser.id)

      const { data: targetUser, error: userError } = await supabase
        .from("utilisateurs")
        .select("*")
        .eq("id", userId)
        .single()

      if (userError) {
        console.error("Error fetching user:", userError)
        setLoading(false)
        return
      }

      const { data: userPosts } = await supabase
        .from("posts")
        .select("*")
        .eq("utilisateur_id", userId)
        .order("created_at", { ascending: false })
        .limit(3)

      const { count: abonnésCount } = await supabase
        .from("abonnements")
        .select("*", { count: "exact", head: true })
        .eq("abonnement_id", userId)

      const { count: abonnementsCount } = await supabase
        .from("abonnements")
        .select("*", { count: "exact", head: true })
        .eq("abonne_id", userId)

      const { data: avisData, error: avisError } = await supabase
        .from("avis")
        .select("avis")
        .eq("freelancer_id", userId)

      let moyenne = null
      if (avisData && avisData.length > 0) {
        const somme = avisData.reduce((acc, curr) => acc + curr.avis, 0)
        moyenne = (somme / avisData.length).toFixed(1)
      }

      const missionsRealisees = avisData?.length ?? 0

      const { data: abonnement } = await supabase
        .from("abonnements")
        .select("*")
        .eq("abonne_id", sessionUser.id)
        .eq("abonnement_id", userId)
        .single()

      setUser({
        ...targetUser,
        abonnésCount,
        abonnementsCount,
        note: moyenne ? Number(moyenne) : undefined,
        missions_realisees: missionsRealisees,
      })
      setPosts(userPosts || [])
      setIsFollowing(!!abonnement)
    } catch (error) {
      console.error("Error fetching profile data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [userId])

  const handleFollowToggle = async () => {
    if (!sessionUserId || !userId || sessionUserId === userId) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        await supabase.from("abonnements").delete().eq("abonne_id", sessionUserId).eq("abonnement_id", userId)
      } else {
        await supabase.from("abonnements").insert([{ abonne_id: sessionUserId, abonnement_id: userId }])
      }

      await fetchData()
    } catch (error) {
      console.error("Error toggling follow status:", error)
    } finally {
      setFollowLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto px-4 py-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#52c1ff]" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto px-4 py-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Utilisateur introuvable</h3>
          <p className="text-gray-600 mb-6">Ce profil n'existe pas ou n'est plus disponible.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-[#52c1ff] to-[#ffbb88] text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    )
  }

  const roleLabel = user.role === 1 ? "Freelance" : user.role === 2 ? "Entreprise" : "Administrateur"
  const roleConfig =
    user.role === 1
      ? {
          gradient: "from-[#52c1ff] to-[#52c1ff]/80",
          bgLight: "from-[#52c1ff]/10 to-[#52c1ff]/5",
          border: "border-[#52c1ff]/20",
          text: "text-[#52c1ff]",
          icon: <User className="w-4 h-4" />,
        }
      : {
          gradient: "from-[#ffbb88] to-[#ffbb88]/80",
          bgLight: "from-[#ffbb88]/10 to-[#ffbb88]/5",
          border: "border-[#ffbb88]/20",
          text: "text-[#ffbb88]",
          icon: <Briefcase className="w-4 h-4" />,
        }

  const avatar = user.avatar || "/placeholder.svg?height=200&width=200"

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto px-4 py-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-md max-h-[90vh] shadow-2xl border border-white/20 relative overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors shadow-sm"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Avatar with role indicator */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg">
              <img src={avatar || "/placeholder.svg"} alt={user.nom} className="w-full h-full object-cover" />
            </div>
            <div
              className={`absolute -bottom-2 -right-2 bg-gradient-to-r ${roleConfig.gradient} text-white px-3 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1`}
            >
              {roleConfig.icon}
              {roleLabel}
            </div>
          </div>

          {/* User name */}
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.nom}</h2>

          {/* Location if available */}
          {user.localisation && (
            <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
              <MapPin className="w-3 h-3" />
              <span>{user.localisation}</span>
            </div>
          )}

          {/* Follow button */}
          {sessionUserId && sessionUserId !== userId && (
            <button
              onClick={handleFollowToggle}
              disabled={followLoading}
              className={`mt-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                isFollowing
                  ? "bg-gradient-to-r from-red-500/10 to-red-500/5 text-red-500 hover:from-red-500/20 hover:to-red-500/10 border border-red-200"
                  : "bg-[#52c1ff] text-white hover:shadow-lg"
              }`}
            >
              {followLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isFollowing ? (
                <UserMinus className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isFollowing ? "Se désabonner" : "S'abonner"}
            </button>
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <Stat
              icon={<Users className="w-5 h-5 text-[#52c1ff]" />}
              label="Abonnés"
              value={user.abonnésCount ?? 0}
              bgColor="from-[#52c1ff]/10 to-[#52c1ff]/5"
              borderColor="border-[#52c1ff]/20"
            />
            <Stat
              icon={<Users className="w-5 h-5 text-[#ffbb88]" />}
              label="Abonnements"
              value={user.abonnementsCount ?? 0}
              bgColor="from-[#ffbb88]/10 to-[#ffbb88]/5"
              borderColor="border-[#ffbb88]/20"
            />
            {user.role === 1 && (
              <>
                <Stat
                  icon={<Star className="w-5 h-5 text-yellow-500" />}
                  label="Note"
                  value={user.note ?? "—"}
                  bgColor="from-yellow-500/10 to-yellow-500/5"
                  borderColor="border-yellow-200"
                />
                <Stat
                  icon={<Briefcase className="w-5 h-5 text-purple-500" />}
                  label="Missions"
                  value={user.missions_realisees ?? 0}
                  bgColor="from-purple-500/10 to-purple-500/5"
                  borderColor="border-purple-200"
                />
              </>
            )}
          </div>
        </div>

        {/* Contact and links */}
        {(user.email || user.linkedin || user.portfolio) && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#52c1ff]" />
              Contact et liens
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {user.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#52c1ff]/10 to-[#52c1ff]/5 border border-[#52c1ff]/20 hover:shadow-md transition-all group"
                >
                  <Mail className="w-5 h-5 text-[#52c1ff]" />
                  <span className="text-sm text-gray-700 group-hover:text-[#52c1ff] transition-colors">
                    {user.email}
                  </span>
                </a>
              )}

              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-200 hover:shadow-md transition-all group"
                >
                  <FaLinkedin className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">LinkedIn</span>
                  <ExternalLink className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" />
                </a>
              )}

              {user.portfolio && (
                <a
                  href={user.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#ffbb88]/10 to-[#ffbb88]/5 border border-[#ffbb88]/20 hover:shadow-md transition-all group"
                >
                  <ExternalLink className="w-5 h-5 text-[#ffbb88]" />
                  <span className="text-sm text-gray-700 group-hover:text-[#ffbb88] transition-colors">Portfolio</span>
                  <ExternalLink className="w-4 h-4 text-gray-400 ml-auto group-hover:text-[#ffbb88] transition-colors" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Experience and availability for freelancers */}
        {user.role === 1 && (user.experience || user.disponibilite) && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#52c1ff]" />
              Profil professionnel
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {user.experience && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                  <div>
                    <span className="text-xs text-gray-500">Expérience</span>
                    <p className="text-sm text-gray-700">{user.experience}</p>
                  </div>
                </div>
              )}

              {user.disponibilite && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <span className="text-xs text-gray-500">Disponibilité</span>
                    <p className="text-sm text-gray-700">{user.disponibilite}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent posts */}
        {posts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-[#52c1ff]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
                <path d="M12 8v4l2.5 2.5" />
                <path d="M16.8 16.8 18 18" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.9 4.9 1.4 1.4" />
                <path d="m17.7 17.7 1.4 1.4" />
                <path d="m17.7 6.3-1.4 1.4" />
                <path d="m4.9 19.1 1.4-1.4" />
              </svg>
              Publications récentes
            </h3>
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">{post.titre}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.contenu}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  bgColor,
  borderColor,
}: {
  icon: React.ReactNode
  label: string
  value: any
  bgColor: string
  borderColor: string
}) {
  return (
    <div
      className={`flex flex-col items-center p-3 rounded-xl bg-gradient-to-r ${bgColor} border ${borderColor} hover:shadow-md transition-all`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-base font-semibold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}
