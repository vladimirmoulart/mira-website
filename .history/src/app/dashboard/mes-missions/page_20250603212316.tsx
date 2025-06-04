"use client"

import DashboardLayout from "@/app/components/nav/DashboardLayout"
import { supabase } from "../../../../lib/supabaseClient"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, DollarSign, ArrowRight, Loader2 } from "lucide-react"

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
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-[#52c1ff]" />
            <span className="text-sm text-gray-600">Chargement</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const totalMissions = missionsEnCours.length + missionsTerminees.length

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-4xl font-light text-gray-900 mb-2">Missions</h1>
            <div className="w-12 h-px bg-[#52c1ff]"></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-12 mb-20">
            <div className="space-y-2">
              <div className="text-3xl font-light text-gray-900">{missionsEnCours.length}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">En cours</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-light text-gray-900">{missionsTerminees.length}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Terminées</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-light text-gray-900">{totalMissions}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Total</div>
            </div>
          </div>

          {/* Missions en cours */}
          <section className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-light text-gray-900">En cours</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {missionsEnCours.length > 0 ? (
              <div className="space-y-6">
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
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-light text-gray-900">Terminées</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {missionsTerminees.length > 0 ? (
              <div className="space-y-6">
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

  return (
    <div className="group border-b border-gray-100 pb-6 hover:border-[#52c1ff] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900">{mission.titre}</h3>
            <div className={`w-2 h-2 rounded-full ${isEnCours ? "bg-[#52c1ff]" : "bg-gray-400"}`}></div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{mission.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm text-gray-500">
          {mission.budget && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>{mission.budget}€</span>
            </div>
          )}
          {mission.localisation && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{mission.localisation}</span>
            </div>
          )}
          {mission.duree && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{mission.duree}</span>
            </div>
          )}
        </div>

        {status === "en-cours" && (
          <button
            onClick={() => onViewDetails(mission.id)}
            className="text-[#52c1ff] hover:text-[#52c1ff]/80 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Détails
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {mission.competences && mission.competences.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {mission.competences.slice(0, 4).map((skill, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-gray-50 text-gray-600">
              {skill}
            </span>
          ))}
          {mission.competences.length > 4 && (
            <span className="text-xs text-gray-400">+{mission.competences.length - 4}</span>
          )}
        </div>
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
    <div className="py-16 text-center">
      <div className="mb-4">
        <div className="w-12 h-12 bg-gray-50 mx-auto mb-4 flex items-center justify-center">
          <span className="text-gray-400 text-lg">—</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">{description}</p>
        <a
          href={actionHref}
          className="inline-flex items-center gap-2 text-[#52c1ff] hover:text-[#52c1ff]/80 text-sm font-medium"
        >
          {actionText}
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}
