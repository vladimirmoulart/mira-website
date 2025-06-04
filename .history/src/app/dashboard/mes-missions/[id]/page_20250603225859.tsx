"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/app/components/nav/DashboardLayout"
import { supabase } from "../../../../../lib/supabaseClient"
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  User,
  Building2,
  MessageCircle,
  FileText,
  Award,
  Loader2,
  Target,
  CheckCircle,
  Star,
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

interface Entreprise {
  id: string
  nom: string
  avatar?: string
  email: string
}

export default function MissionDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [mission, setMission] = useState<Mission | null>(null)
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null)
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"details" | "chat">("details")
  const [postulationStatus, setPostulationStatus] = useState<string | null>(null)

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
          if (userData) {
            setUtilisateur(userData)

            // Check postulation status
            const { data: postulationData } = await supabase
              .from("postulations")
              .select("statut")
              .eq("id_mission", id)
              .eq("id_utilisateur", userData.id)
              .single()

            if (postulationData) {
              setPostulationStatus(postulationData.statut)
            }
          }
        }

        // Fetch company info
        if (missionData.id_entreprise) {
          const { data: entrepriseData } = await supabase
            .from("utilisateurs")
            .select("*")
            .eq("id", missionData.id_entreprise)
            .single()

          if (entrepriseData) {
            setEntreprise(entrepriseData)
          }
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
      case "acceptée":
        return {
          label: "Mission acceptée",
          color: "#52c1ff",
          icon: <CheckCircle className="w-4 h-4" />,
        }
      case "en_attente":
        return {
          label: "En attente de réponse",
          color: "#ffbb88",
          icon: <Clock className="w-4 h-4" />,
        }
      case "terminé":
        return {
          label: "Mission terminée",
          color: "#10b981",
          icon: <Award className="w-4 h-4" />,
        }
      default:
        return {
          label: "Statut inconnu",
          color: "#6b7280",
          icon: <Target className="w-4 h-4" />,
        }
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#52c1ff]" />
            <p className="text-gray-500 text-sm">Chargement de la mission...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!mission || !utilisateur) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Mission non trouvée</h3>
            <p className="text-gray-500 mb-6">Cette mission n'existe pas ou vous n'y avez pas accès.</p>
            <button
              onClick={() => router.push("/dashboard/mes-missions")}
              className="bg-[#52c1ff] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#52c1ff]/90 transition-colors"
            >
              Retour aux missions
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const statusConfig = postulationStatus ? getStatusConfig(postulationStatus) : null

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header avec navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/mes-missions")}
              className="flex items-center gap-2 text-[#52c1ff] hover:text-[#52c1ff]/80 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour à mes missions
            </button>
          </div>

          {/* Statut de la candidature */}
          {statusConfig && (
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg text-white" style={{ backgroundColor: statusConfig.color }}>
                  {statusConfig.icon}
                </div>
                <div>
                  <h2 className="text-xl font-medium text-gray-900">{statusConfig.label}</h2>
                  <p className="text-gray-500">
                    {postulationStatus === "acceptée"
                      ? "Félicitations ! Votre candidature a été acceptée."
                      : postulationStatus === "en_attente"
                        ? "Votre candidature est en cours d'examen."
                        : postulationStatus === "terminé"
                          ? "Cette mission a été complétée avec succès."
                          : "Statut de votre candidature."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Informations principales de la mission */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-medium text-gray-900 mb-4">{mission.titre}</h1>
                <p className="text-gray-600 leading-relaxed mb-6">{mission.description}</p>

                {/* Entreprise */}
                {entreprise && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <img
                        src={entreprise.avatar || "/placeholder.svg?height=50&width=50"}
                        alt={entreprise.nom}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#52c1ff]" />
                          {entreprise.nom}
                        </h3>
                        <p className="text-sm text-gray-500">Entreprise cliente</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Compétences */}
            {mission.competences && mission.competences.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#52c1ff]" />
                  Compétences requises
                </h3>
                <div className="flex flex-wrap gap-3">
                  {mission.competences.map((skill, i) => (
                    <span key={i} className="bg-[#52c1ff] text-white text-sm px-3 py-1 rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Détails de la mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DetailCard icon={<Clock className="w-5 h-5" />} label="Durée" value={mission.duree} color="#52c1ff" />
              <DetailCard
                icon={<DollarSign className="w-5 h-5" />}
                label="Budget"
                value={`${mission.budget}€`}
                color="#ffbb88"
              />
              <DetailCard
                icon={<Calendar className="w-5 h-5" />}
                label="Créée le"
                value={new Date(mission.date_creation).toLocaleDateString("fr-FR")}
                color="#8b5cf6"
              />
              {mission.date_limite && (
                <DetailCard
                  icon={<Target className="w-5 h-5" />}
                  label="Date limite"
                  value={new Date(mission.date_limite).toLocaleDateString("fr-FR")}
                  color="#10b981"
                />
              )}
              {mission.localisation && (
                <DetailCard
                  icon={<MapPin className="w-5 h-5" />}
                  label="Localisation"
                  value={mission.localisation}
                  color="#6366f1"
                />
              )}
              {mission.niveau && (
                <DetailCard icon={<User className="w-5 h-5" />} label="Niveau" value={mission.niveau} color="#06b6d4" />
              )}
            </div>
          </div>

          {/* Onglets */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("details")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "details"
                    ? "bg-[#52c1ff] text-white"
                    : "text-gray-600 hover:text-[#52c1ff] hover:bg-gray-50"
                }`}
              >
                <FileText className="w-4 h-4" />
                Détails de la mission
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "chat"
                    ? "bg-[#52c1ff] text-white"
                    : "text-gray-600 hover:text-[#52c1ff] hover:bg-gray-50"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Communication
              </button>
            </div>

            <div className="">
              {activeTab === "details" && (
                <div className="space-y-6 p-8">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#52c1ff]" />
                      Description complète
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                      <p className="text-gray-700 leading-relaxed">{mission.description}</p>
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#52c1ff]" />
                      Informations de la mission
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {postulationStatus && (
                        <InfoItem label="Statut de candidature" value={statusConfig?.label || postulationStatus} />
                      )}
                    </div>
                  </div>

                  {/* Évaluation (si mission terminée) */}
                  {postulationStatus === "terminé" && (
                    <div>
                      <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Mission complétée
                      </h3>
                      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                        <div className="flex items-center gap-3 mb-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <span className="font-medium text-green-800">Mission terminée avec succès !</span>
                        </div>
                        <p className="text-green-700">
                          Félicitations pour avoir mené à bien cette mission. Votre travail contribue à votre expérience
                          et à votre réputation sur la plateforme.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "chat" && (
                
                  <ChatRoom missionId={id as string} currentUserId={utilisateur.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function DetailCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg text-white" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-lg font-medium text-gray-900">{value}</div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
      <div className="text-gray-900 font-medium">{value}</div>
    </div>
  )
}
