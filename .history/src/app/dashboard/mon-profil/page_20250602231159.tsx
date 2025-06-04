"use client"

import type React from "react"
import DashboardLayout from "@/app/components/nav/DashboardLayout"
import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"
import Image from "next/image"
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

  useEffect(() => {
  const fetchUserData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user")
      if (!res.ok) {
        console.error("Erreur de récupération utilisateur :", await res.text())
        return
      }
      const userData = await res.json()
      setUserInfo(userData)
      setLinkedin(userData.linkedin || "")
      setPortfolio(userData.portfolio || "")

      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .eq("utilisateur_id", userData.id)
        .order("created_at", { ascending: false })
      setPosts(postsData || [])

      const { count: abonnes } = await supabase
        .from("abonnements")
        .select("*", { count: "exact", head: true })
        .eq("abonnement_id", userData.id)

      const { count: abonnements } = await supabase
        .from("abonnements")
        .select("*", { count: "exact", head: true })
        .eq("abonne_id", userData.id)

      setAbonnesCount(abonnes || 0)
      setAbonnementsCount(abonnements || 0)
    } catch (e) {
      console.error("Erreur fetchUserData:", e)
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#52c1ff]" />
            <p className="text-gray-600">Chargement du profil...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!userInfo) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Profil non trouvé</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { nom, role, avatar, note, missions_realisees } = userInfo
  const roleLabel = role === 1 ? "Freelance" : role === 2 ? "Entreprise" : "Administrateur"

  return (
    <Navbar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-8 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header du profil */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Avatar avec upload */}
              <div className="relative group">
                <div className="relative">
                  <Image
                    src={avatar || "/placeholder.svg?height=150&width=150"}
                    alt="Photo de profil"
                    width={150}
                    height={150}
                    className="rounded-3xl object-cover ring-4 ring-white shadow-2xl group-hover:ring-[#52c1ff]/50 transition-all duration-300"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-[#ffbb88] rounded-2xl p-3 cursor-pointer hover:scale-110 transition-transform shadow-lg group">
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  <Camera className="w-5 h-5 text-white" />
                </label>
              </div>

              {/* Informations utilisateur */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                  {nom}
                </h1>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-white font-semibold shadow-lg mb-6 ${
                    role === 1
                      ? "bg-gradient-to-r from-[#52c1ff] to-[#52c1ff]/80"
                      : "bg-gradient-to-r from-[#ffbb88] to-[#ffbb88]/80"
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
                    gradient="from-[#52c1ff] to-[#52c1ff]/80"
                  />
                  <StatCard
                    icon={<Users className="w-5 h-5" />}
                    label="Abonnements"
                    value={abonnementsCount}
                    gradient="from-[#ffbb88] to-[#ffbb88]/80"
                  />
                  {role === 1 && (
                    <>
                      <StatCard
                        icon={<Star className="w-5 h-5" />}
                        label="Notation"
                        value={note ?? "—"}
                        gradient="from-yellow-500 to-orange-500"
                      />
                      <StatCard
                        icon={<Briefcase className="w-5 h-5" />}
                        label="Missions"
                        value={missions_realisees ?? 0}
                        gradient="from-green-500 to-emerald-500"
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
              gradient="from-[#52c1ff] to-[#52c1ff]/80"
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
              gradient="from-[#ffbb88] to-[#ffbb88]/80"
            />
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                  <UploadCloud className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">CV</h3>
              </div>
              <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 transition-colors cursor-pointer text-center">
                <span className="text-sm text-gray-600">Cliquez pour importer votre CV</span>
                <input type="file" accept="application/pdf" onChange={handleCvUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Posts */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-[#ffbb88] rounded-xl">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              Mes publications
            </h2>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <p className="text-gray-500 mb-4">Aucune publication pour le moment</p>
                <p className="text-sm text-gray-400">Partagez vos idées avec la communauté !</p>
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
    </Navbar>
  )
}

function StatCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode
  label: string
  value: any
  gradient: string
}) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-all duration-300">
      <div className={`p-3 bg-gradient-to-r ${gradient} rounded-xl mb-3 w-fit`}>{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
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
  gradient,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (val: string) => void
  onSave: () => void
  editing: boolean
  setEditing: (editing: boolean) => void
  placeholder: string
  gradient: string
}) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 bg-gradient-to-r ${gradient} rounded-2xl text-white`}>{icon}</div>
        <h3 className="font-semibold text-gray-900">{label}</h3>
      </div>
      {editing ? (
        <div className="space-y-3">
          <input
            type="url"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Check className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
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
            className="flex items-center gap-2 text-[#52c1ff] hover:text-[#ffbb88] transition-colors"
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
  const gradients = [
    "from-[#52c1ff]/10 to-[#52c1ff]/5",
    "from-[#ffbb88]/10 to-[#ffbb88]/5",
    "from-purple-500/10 to-purple-500/5",
    "from-green-500/10 to-green-500/5",
  ]

  const borderColors = ["border-[#52c1ff]/20", "border-[#ffbb88]/20", "border-purple-500/20", "border-green-500/20"]

  return (
    <div
      className={`bg-gradient-to-br ${gradients[index % 4]} border ${
        borderColors[index % 4]
      } rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#52c1ff] transition-colors">
          {post.titre}
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          {new Date(post.created_at).toLocaleDateString("fr-FR")}
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{post.contenu}</p>
    </div>
  )
}
