"use client"

import type React from "react"

import { useEffect, useState } from "react"
import DashboardLayout from "@/app/components/nav/DashboardLayout" 
import { supabase } from "../../../../lib/supabaseClient"
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
    router.push(`/mes-missions/${missionId}`)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-8 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header avec statistiques */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#52c1ff] to-[#ffbb88] bg-clip-text text-transparent mb-4">
                📋 Mes Missions
              </h1>
              <p className="text-gray-600">Gérez et suivez l'avancement de vos missions</p>
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
                icon={<CheckCircle className="w-6 h-6" />}
                title="Terminées"
                value={missionsTerminees.length}
                gradient="from-[#ffbb88] to-[#ffbb88]/80"
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
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-[#52c1ff] to-[#52c1ff]/80 rounded-2xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Missions en cours</h2>
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
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-[#ffbb88] to-[#ffbb88]/80 rounded-2xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Missions terminées</h2>
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
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 bg-gradient-to-r ${gradient} rounded-xl text-white`}>{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
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
      gradient: "from-[#52c1ff]/10 to-[#52c1ff]/5",
      border: "border-[#52c1ff]/20",
      badge: "bg-gradient-to-r from-[#52c1ff] to-[#52c1ff]/80",
      icon: <Clock className="w-4 h-4" />,
      text: "En cours",
    },
    terminee: {
      gradient: "from-[#ffbb88]/10 to-[#ffbb88]/5",
      border: "border-[#ffbb88]/20",
      badge: "bg-gradient-to-r from-[#ffbb88] to-[#ffbb88]/80",
      icon: <CheckCircle className="w-4 h-4" />,
      text: "Terminée",
    },
  }

  const config = statusConfig[status]

  return (
    <div
      className={`bg-gradient-to-br ${config.gradient} border ${config.border} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#52c1ff] transition-colors line-clamp-2">
          {mission.titre}
        </h3>
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
                isEnCours ? "bg-[#52c1ff]/20 text-[#52c1ff]" : "bg-[#ffbb88]/20 text-[#ffbb88]"
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
      <button
        onClick={() => onViewDetails(mission.id)}
        className="w-full bg-gradient-to-r from-[#52c1ff] to-[#ffbb88] hover:from-[#52c1ff]/90 hover:to-[#ffbb88]/90 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn"
      >
        Voir les détails
        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </button>
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
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-12 text-center">
      <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      <a
        href={actionHref}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#52c1ff] to-[#ffbb88] hover:from-[#52c1ff]/90 hover:to-[#ffbb88]/90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
      >
        {actionText}
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  )
}
