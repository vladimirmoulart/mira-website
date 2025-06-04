"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"
import Image from "next/image"
import DashboardLayout from "@/app/components/nav/DashboardLayout"
import {
  Users,
  Star,
  Briefcase,
  UploadCloud,
  Link,
  Camera,
  Calendar,
  Award,
  ExternalLink,
  Loader2,
  Edit3,
  Check,
} from "lucide-react"
import ModalAbonnements from "@/app/components/ModalAbonnements"
import ModalAbonnes from "@/app/components/ModalAbonnes"
import ModalAvis from "@/app/components/ModalAvis"
import ModalMissions from "@/app/components/ModalMissions"

interface UserInfo {
  id: string
  nom: string
  role: number
  avatar?: string
  note?: number
  missions_realisees?: number
  linkedin?: string
  portfolio?: string
  email: string
}

interface Post {
  id: string
  titre: string
  contenu: string
  created_at: string
}

export default function ProfilPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [abonnesCount, setAbonnesCount] = useState<number>(0)
  const [abonnementsCount, setAbonnementsCount] = useState<number>(0)
  const [uploading, setUploading] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [linkedin, setLinkedin] = useState("")
  const [portfolio, setPortfolio] = useState("")
  const [editingLinkedin, setEditingLinkedin] = useState(false)
  const [editingPortfolio, setEditingPortfolio] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAbonnesModal, setShowAbonnesModal] = useState(false)
  const [showAbonnementsModal, setShowAbonnementsModal] = useState(false)
  const [showAvisModal, setShowAvisModal] = useState(false)
  const [showMissionsModal, setShowMissionsModal] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: userData } = await supabase.from("utilisateurs").select("*").eq("email", user.email).single()

          const { data: avisData, error: avisError } = await supabase
            .from("avis")
            .select("avis")
            .eq("freelancer_id", userData.id)

          let moyenne = null
          let missionsRealisees = 0

          if (avisData && avisData.length > 0) {
            const somme = avisData.reduce((acc, curr) => acc + curr.avis, 0)
            moyenne = (somme / avisData.length).toFixed(1)
            missionsRealisees = avisData.length
          }

          if (userData) {
            setUserInfo({
              ...userData,
              note: moyenne ? Number(moyenne) : undefined,
              missions_realisees: missionsRealisees,
            })

            setLinkedin(userData.linkedin || "")
            setPortfolio(userData.portfolio || "")

            const { data: postsData } = await supabase
              .from("posts")
              .select("*")
              .eq("utilisateur_id", userData.id)
              .order("created_at", { ascending: false })
            setPosts(postsData || [])

            const { count: abonnés } = await supabase
              .from("abonnements")
              .select("*", { count: "exact", head: true })
              .eq("abonnement_id", userData.id)

            const { count: abonnements } = await supabase
              .from("abonnements")
              .select("*", { count: "exact", head: true })
              .eq("abonne_id", userData.id)

            setAbonnesCount(abonnés || 0)
            setAbonnementsCount(abonnements || 0)
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file || !userInfo) throw new Error("Aucun fichier sélectionné")

      const fileExt = file.name.split(".").pop()
      const fileName = `${userInfo.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { cacheControl: "3600", upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from("utilisateurs")
        .update({ avatar: publicUrl })
        .eq("id", userInfo.id)

      if (updateError) throw updateError

      setUserInfo((prev) => (prev ? { ...prev, avatar: publicUrl } : null))
    } catch (error: any) {
      alert("Erreur lors du changement de photo : " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && userInfo) {
      setCvFile(file)
      await supabase.storage.from("cvs").upload(`${userInfo.id}/cv.pdf`, file, { upsert: true })
      alert("CV téléversé avec succès !")
    }
  }

  const handleLinkedinSave = async () => {
    if (userInfo) {
      await supabase.from("utilisateurs").update({ linkedin }).eq("id", userInfo.id)
      setEditingLinkedin(false)
    }
  }

  const handlePortfolioSave = async () => {
    if (userInfo) {
      await supabase.from("utilisateurs").update({ portfolio }).eq("id", userInfo.id)
      setEditingPortfolio(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#52c1ff]" />
            <p className="text-gray-500 text-sm">Chargement du profil...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!userInfo) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Profil non trouvé</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { nom, role, avatar, note, missions_realisees } = userInfo
  const roleLabel = role === 1 ? "Freelance" : role === 2 ? "Entreprise" : "Administrateur"

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header du profil */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Avatar avec upload */}
              <div className="relative group">
                <div className="relative">
                  <Image
                    src={avatar || "/placeholder.svg?height=120&width=120"}
                    alt="Photo de profil"
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-4 border-white shadow-sm"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-1 right-1 bg-[#52c1ff] rounded-full p-2 cursor-pointer hover:bg-[#52c1ff]/90 transition-colors shadow-sm">
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  <Camera className="w-4 h-4 text-white" />
                </label>
              </div>

              {/* Informations utilisateur */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl font-medium text-gray-900 mb-3">{nom}</h1>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium text-sm mb-6 ${
                    role === 1 ? "bg-[#ffbb88]" : "bg-[#52c1ff]"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  {roleLabel}
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    icon={<Users className="w-5 h-5" />}
                    label="Abonnés"
                    value={abonnesCount}
                    color="#52c1ff"
                    onClick={() => setShowAbonnesModal(true)}
                  />
                  <StatCard
                    icon={<Users className="w-5 h-5" />}
                    label="Abonnements"
                    value={abonnementsCount}
                    color="#ffbb88"
                    onClick={() => setShowAbonnementsModal(true)}
                  />
                  {role === 1 && (
                    <>
                      <StatCard
                        icon={<Star className="w-5 h-5" />}
                        label="Notation"
                        value={note ?? "—"}
                        color="#fbbf24"
                        onClick={() => setShowAvisModal(true)}
                      />
                      <StatCard
                        icon={<Briefcase className="w-5 h-5" />}
                        label="Missions"
                        value={missions_realisees ?? 0}
                        color="#10b981"
                        onClick={() => setShowMissionsModal(true)}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Liens sociaux et CV */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SocialLinkCard
              icon={<Link className="w-5 h-5" />}
              label="LinkedIn"
              value={linkedin}
              onChange={setLinkedin}
              onSave={handleLinkedinSave}
              editing={editingLinkedin}
              setEditing={setEditingLinkedin}
              placeholder="Votre profil LinkedIn"
              color="#52c1ff"
            />
            <SocialLinkCard
              icon={<ExternalLink className="w-5 h-5" />}
              label="Portfolio"
              value={portfolio}
              onChange={setPortfolio}
              onSave={handlePortfolioSave}
              editing={editingPortfolio}
              setEditing={setEditingPortfolio}
              placeholder="Votre portfolio"
              color="#ffbb88"
            />
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <UploadCloud className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-gray-900">CV</h3>
              </div>
              <label className="block w-full p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-purple-400 transition-colors cursor-pointer text-center">
                <span className="text-sm text-gray-600">Cliquez pour importer votre CV</span>
                <input type="file" accept="application/pdf" onChange={handleCvUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Posts */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-[#52c1ff] rounded-full"></span>
              Mes publications
            </h2>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune publication</h3>
                <p className="text-gray-500 text-sm">Partagez vos idées avec la communauté !</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {posts.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {showAbonnesModal && <ModalAbonnes userId={userInfo.id} onClose={() => setShowAbonnesModal(false)} />}

      {showAbonnementsModal && <ModalAbonnements userId={userInfo.id} onClose={() => setShowAbonnementsModal(false)} />}

      {showAvisModal && <ModalAvis userId={userInfo.id} onClose={() => setShowAvisModal(false)} />}

      {showMissionsModal && userInfo && (
        <ModalMissions userId={userInfo.id} onClose={() => setShowMissionsModal(false)} />
      )}
    </DashboardLayout>
  )
}

function StatCard({
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
      className="cursor-pointer bg-white border border-gray-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
    >
      <div className="p-2 rounded-lg mb-3 w-fit text-white" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="text-2xl font-medium text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function SocialLinkCard({
  icon,
  label,
  value,
  onChange,
  onSave,
  editing,
  setEditing,
  placeholder,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (val: string) => void
  onSave: () => void
  editing: boolean
  setEditing: (editing: boolean) => void
  placeholder: string
  color: string
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg text-white" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <h3 className="font-medium text-gray-900">{label}</h3>
      </div>
      {editing ? (
        <div className="space-y-3">
          <input
            type="url"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              <Check className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-600 text-sm">{value || "Non renseigné"}</p>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 text-[#52c1ff] hover:text-[#52c1ff]/80 transition-colors text-sm"
          >
            <Edit3 className="w-4 h-4" />
            Modifier
          </button>
        </div>
      )}
    </div>
  )
}

function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{post.titre}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          {new Date(post.created_at).toLocaleDateString("fr-FR")}
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{post.contenu}</p>
    </div>
  )
}
