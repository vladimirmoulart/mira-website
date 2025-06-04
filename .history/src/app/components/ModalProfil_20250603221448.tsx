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

import ModalAvis from "./ModalAvis"
import ModalAbonnes from "./ModalAbonnes"
import ModalAbonnements from "./ModalAbonnements"
import ModalMissions from "./ModalMissions"

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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto px-4 py-6">
        <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#52c1ff]" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto px-4 py-6">
        <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Utilisateur introuvable</h3>
          <p className="text-gray-500 text-sm mb-6">Ce profil n'existe pas ou n'est plus disponible.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#52c1ff] text-white rounded-lg font-medium hover:bg-[#52c1ff]/90 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    )
  }

  const roleLabel = user.role === 1 ? "Freelance" : user.role === 2 ? "Entreprise" : "Administrateur"
  const roleColor = user.role === 1 ? "#ffbb88" : "#52c1ff"
  const avatar = user.avatar || "/placeholder.svg?height=120&width=120"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto px-4 py-6">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] shadow-lg relative overflow-y-auto p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Avatar with role indicator */}
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white">
              <img src={avatar || "/placeholder.svg"} alt={user.nom} className="w-full h-full object-cover" />
            </div>
            <div
              className="absolute -bottom-1 -right-1 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
              style={{ backgroundColor: roleColor }}
            >
              {user.role === 1 ? <User className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
              {roleLabel}
            </div>
          </div>

          {/* User name */}
          <h2 className="text-xl font-medium text-gray-900 mb-1">{user.nom}</h2>

          {/* Location if available */}
          {user.localisation && (
            <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
              <MapPin className="w-3 h-3" />
              <span>{user.localisation}</span>
            </div>
          )}

          {/* Follow button */}
          {sessionUserId && sessionUserId !== userId && (
            <button
              onClick={handleFollowToggle}
              disabled={followLoading}
              className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isFollowing
                  ? "bg-red-50 text-red-500 hover:bg-red-100 border border-red-200"
                  : "bg-[#52c1ff] text-white hover:bg-[#52c1ff]/90"
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
              icon={<Users className="w-4 h-4" />}
              label="Abonnés"
              value={user.abonnésCount ?? 0}
              color="#52c1ff"
              onClick={() => setShowAbonnesModal(true)}
            />
            <Stat
              icon={<Users className="w-4 h-4" />}
              label="Abonnements"
              value={user.abonnementsCount ?? 0}
              color="#ffbb88"
              onClick={() => setShowAbonnementsModal(true)}
            />
            {user.role === 1 && (
              <>
                <Stat
                  icon={<Star className="w-4 h-4" />}
                  label="Note"
                  value={user.note ?? "—"}
                  color="#fbbf24"
                  onClick={() => setShowAvisModal(true)}
                />
                <Stat
                  icon={<Briefcase className="w-4 h-4" />}
                  label="Missions"
                  value={user.missions_realisees ?? 0}
                  color="#10b981"
                  onClick={() => setShowMissionsModal(true)}
                />
              </>
            )}
          </div>
        </div>

        {/* Contact and links */}
        {(user.email || user.linkedin || user.portfolio) && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#52c1ff]" />
              Contact et liens
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {user.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-[#52c1ff]/30 transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#52c1ff]" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </a>
              )}

              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-blue-300 transition-colors"
                >
                  <FaLinkedin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                </a>
              )}

              {user.portfolio && (
                <a
                  href={user.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-[#ffbb88]/30 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-[#ffbb88]" />
                  <span className="text-sm text-gray-700">Portfolio</span>
                  <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Experience and availability for freelancers */}
        {user.role === 1 && (user.experience || user.disponibilite) && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#52c1ff]" />
              Profil professionnel
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {user.experience && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-xs text-gray-500">Expérience</span>
                    <p className="text-sm text-gray-700">{user.experience}</p>
                  </div>
                </div>
              )}

              {user.disponibilite && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-500" />
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
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#52c1ff]" />
              Publications récentes
            </h3>
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <h4 className="font-medium text-gray-900 mb-1">{post.titre}</h4>
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
        {/* Modals */}
        {showAbonnementsModal && <ModalAbonnements userId={userId} onClose={() => setShowAbonnementsModal(false)} />}

        {showAbonnesModal && <ModalAbonnes userId={userId} onClose={() => setShowAbonnesModal(false)} />}

        {showAvisModal && <ModalAvis userId={userId} onClose={() => setShowAvisModal(false)} />}

        {showMissionsModal && <ModalMissions userId={userId} onClose={() => setShowMissionsModal(false)} />}
      </div>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: any
  color: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
    >
      <div className="mb-1" style={{ color }}>
        {icon}
      </div>
      <span className="text-base font-medium text-gray-900">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}
