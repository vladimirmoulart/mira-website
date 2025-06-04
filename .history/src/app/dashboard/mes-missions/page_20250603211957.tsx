"use client"

import type React from "react"

import DashboardLayout from "@/app/components/nav/DashboardLayout"
import { supabase } from "../../../../lib/supabaseClient"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, CheckCircle, Calendar, MapPin, DollarSign, ArrowRight, Loader2, Trophy, Target } from "lucide-react"

interface Mission {
  id: number
  titre: string
  description: string
  competences: string[]
  budget?: number
  localisation?: string
  date_limite?: string
  duree?: string
  niveau?: string
}

interface Postulation {
  id: number
  statut: string
  missions: Mission
  date_postulation?: string
}

export default function MesMissionsPage() {
  const [missionsEnCours, setMissionsEnCours] = useState<Mission[]>([])
  const [missionsTerminees, setMissionsTerminees] = useState<Mission[]>([])
  const [utilisateur, setUtilisateur] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: utilisateurData } = await supabase
            .from("utilisateurs")
            .select("id, role")
            .eq("email", user.email)
            .single()

          if (!utilisateurData || utilisateurData.role !== 1) {
            router.push("/dashboard")
            return
          }

          setUtilisateur(utilisateurData)

          const { data: postulationsData } = await supabase
            .from("postulations")
            .select("*, missions (*)")
            .eq("id_utilisateur", utilisateurData.id)

          if (postulationsData) {
            const enCours = postulationsData.filter((p) => p.statut === "acceptée").map((p) => p.missions)
            const terminees = postulationsData.filter((p) => p.statut === "terminé").map((p) => p.missions)

            setMissionsEnCours(enCours)
            setMissionsTerminees(terminees)
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des missions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMissions()
  }, [router])

  const handleVoirDetails = (missionId: number) => {
    router.push(`/dashboard/mes-missions/${missionId}`)
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

  const totalMissions = missionsEnCours.length + missionsTerminees.length

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-3 mb-16">
            <h1 className="text-4xl font-light text-gray-900">Mes missions</h1>
            <div className="w-16 h-0.5 bg-[#52c1ff]"></div>
            <p className="text-gray-600">Gérez vos projets en cours et terminés</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              title="En cours"
              value={missionsEnCours.length}
              color="#52c1ff"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5" />}
              title="Terminées"
              value={missionsTerminees.length}
              color="#10b981"
            />
            <StatCard icon={<Trophy className="w-5 h-5" />} title="Total" value={totalMissions} color="#ffbb88" />
          </div>

          {/* Missions en cours */}
          <section className="space-y-6">
            <div className="flex items-center gap-6 mb-8">
              <h2 className="text-2xl font-light text-gray-900">En cours</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-500">{missionsEnCours.length}</span>
            </div>

            {missionsEnCours.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {missionsEnCours.map((mission, index) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    status="en-cours"
                    onViewDetails={handleVoirDetails}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucune mission en cours"
                description="Vous n'avez pas de mission active pour le moment."
                actionText="Rechercher des missions"
                actionHref="/rechercher-une-mission"
              />
            )}
          </section>

          {/* Missions terminées */}
          <section className="space-y-6">
            <div className="flex items-center gap-6 mb-8">
              <h2 className="text-2xl font-light text-gray-900">Terminées</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-500">{missionsTerminees.length}</span>
            </div>

            {missionsTerminees.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {missionsTerminees.map((mission, index) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    status="terminee"
                    onViewDetails={handleVoirDetails}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucune mission terminée"
                description="Vous n'avez pas encore complété de mission."
                actionText="Voir les missions disponibles"
                actionHref="/rechercher-une-mission"
              />
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: number
  color: string
}) {
  return (
    <div className="bg-white border border-gray-100 p-8 hover:border-gray-200 transition-colors">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 text-white" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <h3 className="font-medium text-gray-900 text-lg">{title}</h3>
      </div>
      <div className="text-4xl font-light text-gray-900">{value}</div>
    </div>
  )
}

function MissionCard({
  mission,
  status,
  onViewDetails,
  index,
}: {
  mission: Mission
  status: "en-cours" | "terminee"
  onViewDetails: (id: number) => void
  index: number
}) {
  const isEnCours = status === "en-cours"
  const statusColor = isEnCours ? "#52c1ff" : "#10b981"

  return (
    <div className="bg-white border border-gray-100 p-8 hover:border-gray-200 transition-all duration-300 group">
      {/* Status indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColor }}></div>
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {isEnCours ? "En cours" : "Terminée"}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-medium text-gray-900 mb-3 line-clamp-2">{mission.titre}</h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">{mission.description}</p>

      {/* Compétences */}
      {mission.competences && mission.competences.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {mission.competences.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-xs px-3 py-2 bg-gray-50 text-gray-700 font-medium">
              {skill}
            </span>
          ))}
          {mission.competences.length > 3 && (
            <span className="text-xs text-gray-400 px-2 py-2">+{mission.competences.length - 3}</span>
          )}
        </div>
      )}

      {/* Informations supplémentaires */}
      <div className="space-y-3 mb-8">
        {mission.budget && (
          <div className="flex items-center gap-3 text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="font-medium">{mission.budget}€</span>
          </div>
        )}
        {mission.localisation && (
          <div className="flex items-center gap-3 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{mission.localisation}</span>
          </div>
        )}
        {mission.duree && (
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{mission.duree}</span>
          </div>
        )}
      </div>

      {/* Action button */}
      {status === "en-cours" && (
        <button
          onClick={() => onViewDetails(mission.id)}
          className="w-full bg-white border-2 border-[#52c1ff] text-[#52c1ff] hover:bg-[#52c1ff] hover:text-white py-3 font-medium transition-all duration-300 flex items-center justify-center gap-2 group-hover:border-[#52c1ff]"
        >
          Voir les détails
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

function EmptyState({
  title,
  description,
  actionText,
  actionHref,
}: {
  title: string
  description: string
  actionText: string
  actionHref: string
}) {
  return (
    <div className="bg-white border border-gray-100 p-16 text-center">
      <div className="w-16 h-16 bg-gray-50 mx-auto mb-6 flex items-center justify-center">
        <span className="text-gray-400">
          {actionText.includes("Rechercher") ? <Target className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
        </span>
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">{description}</p>
      <a
        href={actionHref}
        className="inline-flex items-center gap-2 bg-white border-2 border-[#52c1ff] text-[#52c1ff] hover:bg-[#52c1ff] hover:text-white px-6 py-3 font-medium transition-all duration-300"
      >
        {actionText}
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  )
}
