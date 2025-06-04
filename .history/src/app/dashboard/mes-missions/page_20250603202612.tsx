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
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#52c1ff]" />
            <p className="text-gray-600">Chargement de vos missions...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const totalMissions = missionsEnCours.length + missionsTerminees.length

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white py-8 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header avec statistiques */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#52c1ff] rounded-lg flex items-center justify-center">
                  <span className="text-2xl text-white">✨</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Mes missions</h1>
                  <p className="text-gray-600">Toutes les informations relatives à vos missions</p>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={<Clock className="w-6 h-6" />}
                title="En cours"
                value={missionsEnCours.length}
                gradient="from-[#52c1ff] to-[#52c1ff]/80"
                description="Missions actives"
              />
              <StatCard
                icon={<CheckCircle className="w-6 h-6 text-white" />}
                title="Terminées"
                value={missionsTerminees.length}
                gradient="from-green-500 to-green-400"
                description="Missions complétées"
              />

              <StatCard
                icon={<Trophy className="w-6 h-6" />}
                title="Total"
                value={totalMissions}
                gradient="from-purple-500 to-pink-500"
                description="Toutes missions"
              />
            </div>
          </div>

          {/* Missions en cours */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#52c1ff] rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Missions en cours</h2>
                <p className="text-gray-600 text-sm">Vos projets actuellement en développement</p>
              </div>
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
                icon="🎯"
                title="Aucune mission en cours"
                description="Vous n'avez pas de mission active pour le moment."
                actionText="Rechercher des missions"
                actionHref="/rechercher-une-mission"
              />
            )}
          </section>

          {/* Missions terminées */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Missions terminées</h2>
                <p className="text-gray-600 text-sm">Vos projets complétés avec succès</p>
              </div>
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
                icon="🏆"
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
  gradient,
  description,
}: {
  icon: React.ReactNode
  title: string
  value: number
  gradient: string
  description: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`p-3 bg-${gradient === "from-[#52c1ff] to-[#52c1ff]/80" ? "[#52c1ff]" : gradient === "from-green-500 to-green-400" ? "green-500" : "[#ffbb88]"} rounded-lg text-white`}
        >
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
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
  const statusConfig = {
    "en-cours": {
      bg: "bg-white",
      border: "border-gray-100",
      badge: "bg-[#52c1ff]",
      icon: <Clock className="w-4 h-4" />,
      text: "En cours",
    },
    terminee: {
      bg: "bg-white",
      border: "border-gray-100",
      badge: "bg-green-500",
      icon: <CheckCircle className="w-4 h-4" />,
      text: "Terminée",
    },
  }

  const config = statusConfig[status]

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg shadow-sm p-6`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{mission.titre}</h3>
        <div
          className={`${config.badge} text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium`}
        >
          {config.icon}
          {config.text}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{mission.description}</p>

      {/* Compétences */}
      {mission.competences && mission.competences.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {mission.competences.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                isEnCours ? "bg-[#52c1ff]/10 text-[#52c1ff]" : "bg-green-100 text-green-600"
              }`}
            >
              {skill}
            </span>
          ))}
          {mission.competences.length > 3 && (
            <span className="text-xs text-gray-500 px-2 py-1">+{mission.competences.length - 3}</span>
          )}
        </div>
      )}

      {/* Informations supplémentaires */}
      <div className="space-y-2 mb-6">
        {mission.budget && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>{mission.budget}€</span>
          </div>
        )}
        {mission.localisation && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{mission.localisation}</span>
          </div>
        )}
        {mission.duree && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{mission.duree}</span>
          </div>
        )}
      </div>

      {/* Action button */}
      {status === "en-cours" && (
        <button
          onClick={() => onViewDetails(mission.id)}
          className="w-full bg-[#52c1ff] hover:bg-[#52c1ff]/90 text-white py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
        >
          Voir les détails
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
}: {
  icon: string
  title: string
  description: string
  actionText: string
  actionHref: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      <a
        href={actionHref}
        className="inline-flex items-center gap-2 bg-[#ffbb88] hover:bg-[#ffbb88]/90 text-white px-5 py-2 rounded-lg font-medium transition-all duration-300"
      >
        {actionText}
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  )
}
