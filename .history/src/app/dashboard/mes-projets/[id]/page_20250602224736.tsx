"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/app/components/nav/DashboardLayout"
import { supabase } from "../../../../../lib/supabaseClient"
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  User,
  Building2,
  MessageCircle,
  FileText,
  Award,
  Loader2,
  Target,
} from "lucide-react"
import ChatRoom from "@/app/components/ChatRoom"

interface Mission {
  id: string
  titre: string
  description: string
  competences: string[]
  duree: string
  budget: number
  statut: string
  date_creation: string
  date_limite?: string
  localisation?: string
  niveau?: string
  type_contrat?: string
  id_entreprise: string
}

interface Utilisateur {
  id: string
  nom: string
  email: string
  avatar?: string
  role: number
}

export default function ProjetDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [mission, setMission] = useState<Mission | null>(null)
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"details" | "chat">("details")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch mission
        const { data: missionData, error: missionError } = await supabase
          .from("missions")
          .select("*")
          .eq("id", id)
          .single()

        if (missionError) {
          console.error("Erreur lors du chargement de la mission:", missionError)
          return
        }

        setMission(missionData)

        // Fetch user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: userData } = await supabase.from("utilisateurs").select("*").eq("email", user.email).single()
          if (userData) setUtilisateur(userData)
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case "ouverte":
        return {
          label: "En cours",
          gradient: "from-[#52c1ff] to-[#52c1ff]/80",
          icon: <Clock className="w-4 h-4" />,
        }
      case "candidature":
        return {
          label: "En candidature",
          gradient: "from-[#ffbb88] to-[#ffbb88]/80",
          icon: <Target className="w-4 h-4" />,
        }
      case "terminée":
        return {
          label: "Terminée",
          gradient: "from-green-500 to-emerald-500",
          icon: <Award className="w-4 h-4" />,
        }
      default:
        return {
          label: statut,
          gradient: "from-gray-500 to-gray-600",
          icon: <FileText className="w-4 h-4" />,
        }
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#ffbb88]" />
            <p className="text-gray-600">Chargement de la mission...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!mission || !utilisateur) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Mission non trouvée</h3>
            <p className="text-gray-600 mb-6">Cette mission n'existe pas ou vous n'y avez pas accès.</p>
            <button
              onClick={() => router.push("/mes-projets")}
              className="bg-gradient-to-r from-[#ffbb88] to-[#52c1ff] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Retour aux projets
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const statusConfig = getStatusConfig(mission.statut)

  return (
    <Navbar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-8 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header avec navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/mes-projets")}
              className="flex items-center gap-2 text-[#52c1ff] hover:text-[#ffbb88] transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour aux projets
            </button>
          </div>

          {/* Informations principales de la mission */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ffbb88] to-[#52c1ff] bg-clip-text text-transparent">
                    {mission.titre}
                  </h1>
                  <div
                    className={`bg-gradient-to-r ${statusConfig.gradient} text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium`}
                  >
                    {statusConfig.icon}
                    {statusConfig.label}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">{mission.description}</p>
              </div>
            </div>

            {/* Compétences */}
            {mission.competences && mission.competences.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#ffbb88]" />
                  Compétences requises
                </h3>
                <div className="flex flex-wrap gap-3">
                  {mission.competences.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-gradient-to-r from-[#ffbb88]/20 to-[#52c1ff]/20 text-gray-800 text-sm px-4 py-2 rounded-full font-medium border border-[#ffbb88]/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Détails de la mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DetailCard
                icon={<Clock className="w-5 h-5" />}
                label="Durée"
                value={mission.duree}
                gradient="from-[#52c1ff] to-[#52c1ff]/80"
              />
              <DetailCard
                icon={<DollarSign className="w-5 h-5" />}
                label="Budget"
                value={`${mission.budget}€`}
                gradient="from-[#ffbb88] to-[#ffbb88]/80"
              />
              <DetailCard
                icon={<Calendar className="w-5 h-5" />}
                label="Créée le"
                value={new Date(mission.date_creation).toLocaleDateString("fr-FR")}
                gradient="from-purple-500 to-pink-500"
              />
              {mission.date_limite && (
                <DetailCard
                  icon={<Target className="w-5 h-5" />}
                  label="Date limite"
                  value={new Date(mission.date_limite).toLocaleDateString("fr-FR")}
                  gradient="from-green-500 to-emerald-500"
                />
              )}
              {mission.localisation && (
                <DetailCard
                  icon={<MapPin className="w-5 h-5" />}
                  label="Localisation"
                  value={mission.localisation}
                  gradient="from-indigo-500 to-purple-500"
                />
              )}
              {mission.niveau && (
                <DetailCard
                  icon={<User className="w-5 h-5" />}
                  label="Niveau"
                  value={mission.niveau}
                  gradient="from-teal-500 to-cyan-500"
                />
              )}
              {mission.type_contrat && (
                <DetailCard
                  icon={<Building2 className="w-5 h-5" />}
                  label="Type de contrat"
                  value={mission.type_contrat}
                  gradient="from-orange-500 to-red-500"
                />
              )}
            </div>
          </div>

          {/* Onglets */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="flex border-b border-gray-200/50">
              <button
                onClick={() => setActiveTab("details")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === "details"
                    ? "bg-gradient-to-r from-[#ffbb88]/10 to-[#52c1ff]/10 text-[#ffbb88] border-b-2 border-[#ffbb88]"
                    : "text-gray-600 hover:text-[#52c1ff] hover:bg-gray-50"
                }`}
              >
                <FileText className="w-4 h-4" />
                Détails du projet
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === "chat"
                    ? "bg-gradient-to-r from-[#52c1ff]/10 to-[#ffbb88]/10 text-[#52c1ff] border-b-2 border-[#52c1ff]"
                    : "text-gray-600 hover:text-[#ffbb88] hover:bg-gray-50"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Communication
              </button>
            </div>

            <div className="p-8">
              {activeTab === "details" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#ffbb88]" />
                      Description complète
                    </h3>
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6">
                      <p className="text-gray-700 leading-relaxed">{mission.description}</p>
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#52c1ff]" />
                      Informations du projet
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem label="Statut" value={statusConfig.label} />
                      <InfoItem label="Budget" value={`${mission.budget}€`} />
                      <InfoItem label="Durée estimée" value={mission.duree} />
                      <InfoItem
                        label="Date de création"
                        value={new Date(mission.date_creation).toLocaleDateString("fr-FR")}
                      />
                      {mission.date_limite && (
                        <InfoItem
                          label="Date limite"
                          value={new Date(mission.date_limite).toLocaleDateString("fr-FR")}
                        />
                      )}
                      {mission.localisation && <InfoItem label="Localisation" value={mission.localisation} />}
                      {mission.niveau && <InfoItem label="Niveau requis" value={mission.niveau} />}
                      {mission.type_contrat && <InfoItem label="Type de contrat" value={mission.type_contrat} />}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "chat" && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-[#52c1ff]" />
                      Communication du projet
                    </h3>
                    <p className="text-gray-600">
                      Communiquez avec votre équipe et suivez l'avancement du projet en temps réel.
                    </p>
                  </div>
                  <ChatRoom missionId={id as string} currentUserId={utilisateur.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  )
}

function DetailCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode
  label: string
  value: string
  gradient: string
}) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 bg-gradient-to-r ${gradient} rounded-xl text-white`}>{icon}</div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/50 rounded-xl p-4 border border-gray-200/50">
      <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
      <div className="text-gray-900 font-semibold">{value}</div>
    </div>
  )
}
  