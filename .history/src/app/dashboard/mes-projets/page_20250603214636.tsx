"use client"

import type React from "react"
import DashboardLayout from "@/app/components/nav/DashboardLayout"
import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"
import { useRouter } from "next/navigation"
import { CheckCircle, Clock, Users, ArrowRight, Loader2, Building2, FileText, Target, User } from "lucide-react"
import CandidaturesModal, { type Utilisateur as UtilisateurType } from "../../components/CandidaturesModal"
import ModalProfil from "../../components/ModalProfil"

interface Mission {
  id: string
  titre: string
  description: string
  competences: string[]
  statut: "ouverte" | "candidature" | "terminée"
  budget?: number
  date_creation?: string
  date_limite?: string
  id_entreprise: string
}

interface Utilisateur {
  id: string
  nom: string
  avatar?: string
  email?: string
}

export default function MesProjetsPage() {
  const [missionsEnCours, setMissionsEnCours] = useState<Mission[]>([])
  const [missionsCandidature, setMissionsCandidature] = useState<Mission[]>([])
  const [missionsTerminees, setMissionsTerminees] = useState<Mission[]>([])
  const [etudiantsParMission, setEtudiantsParMission] = useState<Record<string, Utilisateur>>({})
  const [postulationsParMission, setPostulationsParMission] = useState<Record<string, number>>({})
  const [modalVisible, setModalVisible] = useState(false)
  const [missionEnCoursId, setMissionEnCoursId] = useState<string | null>(null)
  const [utilisateursCandidats, setUtilisateursCandidats] = useState<UtilisateurType[]>([])
  const [profilVisible, setProfilVisible] = useState(false)
  const [profilUserId, setProfilUserId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const handleAccepter = async (utilisateur: UtilisateurType) => {
    if (!missionEnCoursId) return

    // Étape 1 : Accepter le candidat
    const { error: postulationError } = await supabase
      .from("postulations")
      .update({ statut: "acceptée" })
      .eq("id_utilisateur", utilisateur.id)
      .eq("id_mission", missionEnCoursId)

    if (postulationError) {
      console.error("Erreur lors de l'acceptation :", postulationError)
      return
    }

    // Étape 2 : Mettre à jour le statut de la mission
    const { error: missionError } = await supabase
      .from("missions")
      .update({ statut: "ouverte" })
      .eq("id", missionEnCoursId)

    if (missionError) {
      console.error("Erreur lors de la mise à jour de la mission :", missionError)
      return
    }

    // Étape 3 : Fermer la modale (optionnel)
    console.log("Candidat accepté et mission passée en 'ouverte'")
    setModalVisible(false)
  }

  const handleRefuser = async (utilisateur: UtilisateurType) => {
    if (!missionEnCoursId) return
    const { error } = await supabase
      .from("postulations")
      .update({ statut: "refusée" })
      .eq("id_utilisateur", utilisateur.id)
      .eq("id_mission", missionEnCoursId)

    if (error) {
      console.error("Erreur lors du refus :", error)
    } else {
      console.log("Candidat refusé")
      setModalVisible(false) // Optionnel : refermer la modale
    }
  }

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session?.user) {
          console.error("Erreur de session:", sessionError)
          setLoading(false)
          return
        }

        const user = session.user

        const { data: utilisateur, error: utilisateurError } = await supabase
          .from("utilisateurs")
          .select("id")
          .eq("email", user.email)
          .single()

        if (utilisateurError || !utilisateur) {
          console.error("Erreur lors de la récupération de l'utilisateur:", utilisateurError)
          setLoading(false)
          return
        }

        const utilisateurId = utilisateur.id

        const { data: missionsData, error: missionsError } = await supabase
          .from("missions")
          .select("*")
          .eq("id_entreprise", utilisateurId)

        if (missionsError) {
          console.error("Erreur lors du chargement des missions:", missionsError)
          setLoading(false)
          return
        }

        if (!missionsData) {
          setLoading(false)
          return
        }

        const enCours = missionsData.filter((m) => m.statut === "ouverte")
        const terminees = missionsData.filter((m) => m.statut === "terminée")
        const candidature = missionsData.filter((m) => m.statut === "candidature")

        setMissionsEnCours(enCours)
        setMissionsTerminees(terminees)
        setMissionsCandidature(candidature)

        if (candidature.length > 0) {
          const ids = candidature.map((m) => m.id)
          const { data: postulations } = await supabase.from("postulations").select("id_mission").in("id_mission", ids)

          if (postulations) {
            const countMap: Record<string, number> = {}
            postulations.forEach((p) => {
              countMap[p.id_mission] = (countMap[p.id_mission] || 0) + 1
            })
            setPostulationsParMission(countMap)
          }
        }

        if (terminees.length > 0) {
          const idsMissions = terminees.map((m) => m.id)

          const { data: postulationsTerminees } = await supabase
            .from("postulations")
            .select("id_mission, id_utilisateur")
            .eq("statut", "acceptée")
            .in("id_mission", idsMissions)

          if (postulationsTerminees && postulationsTerminees.length > 0) {
            const utilisateurIds = postulationsTerminees.map((p) => p.id_utilisateur)

            const { data: utilisateursData } = await supabase
              .from("utilisateurs")
              .select("id, nom, avatar")
              .in("id", utilisateurIds)

            if (utilisateursData) {
              const map: Record<string, Utilisateur> = {}
              postulationsTerminees.forEach((p) => {
                const user = utilisateursData.find((u) => u.id === p.id_utilisateur)
                if (user) {
                  map[p.id_mission] = user
                }
              })
              setEtudiantsParMission(map)
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMissions()

    // === Realtime Supabase ===
    const channel = supabase
      .channel("realtime-missions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "missions",
        },
        (payload) => {
          console.log("Mise à jour détectée sur la table missions :", payload)
          fetchMissions()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const handleVoirDetails = (id: string) => {
    router.push(`/dashboard/mes-projets/${id}`)
  }

  const handleAfficherProfil = (utilisateur: UtilisateurType) => {
    setProfilUserId(utilisateur.id)
  }

  const handleVoirCandidatures = async (missionId: string) => {
    setMissionEnCoursId(missionId)
    const { data: postulations } = await supabase
      .from("postulations")
      .select("id_utilisateur")
      .eq("id_mission", missionId)

    if (postulations && postulations.length > 0) {
      const userIds = postulations.map((p) => p.id_utilisateur)
      const { data: users } = await supabase.from("utilisateurs").select("id, nom, avatar, email").in("id", userIds)

      if (users) {
        setUtilisateursCandidats(users)
        setModalVisible(true)
      }
    } else {
      setUtilisateursCandidats([])
      setModalVisible(true)
    }
  }

  const handleCreerMission = () => {
    router.push("/proposer-une-mission")
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

  const totalMissions = missionsEnCours.length + missionsCandidature.length + missionsTerminees.length
  const totalCandidatures = Object.values(postulationsParMission).reduce((sum, count) => sum + count, 0)

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-medium text-gray-900">Mes Projets</h1>
              <p className="text-gray-500">Gérez et suivez l'avancement de vos missions</p>
            </div>
            <button
              onClick={handleCreerMission}
              className="bg-[#52c1ff] hover:bg-[#52c1ff]/90 text-white px-5 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Proposer une nouvelle mission
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              icon={<Building2 className="w-5 h-5" />}
              title="Total"
              value={totalMissions}
              description="Toutes missions"
              color="#ffbb88"
            />
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              title="En cours"
              value={missionsEnCours.length}
              description="Missions actives"
              color="#52c1ff"
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              title="Candidatures"
              value={totalCandidatures}
              description="Candidats reçus"
              color="#8b5cf6"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5" />}
              title="Terminées"
              value={missionsTerminees.length}
              description="Missions complétées"
              color="#10b981"
            />
          </div>

          {/* Missions en cours */}
          <section className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#52c1ff] rounded-full"></span>
              Missions en cours
            </h2>

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
                actionText="Proposer une mission"
                actionHref="/proposer-une-mission"
              />
            )}
          </section>

          {/* Missions en candidature */}
          <section className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ffbb88] rounded-full"></span>
              En phase de candidature
            </h2>

            {missionsCandidature.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {missionsCandidature.map((mission, index) => (
                  <MissionCandidatureCard
                    key={mission.id}
                    mission={mission}
                    candidatureCount={postulationsParMission[mission.id] || 0}
                    onViewDetails={handleVoirCandidatures}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucune mission en phase de candidature"
                description="Vous n'avez pas de mission en attente de candidats."
                actionText="Proposer une mission"
                actionHref="/proposer-une-mission"
              />
            )}
          </section>

          {/* Missions terminées */}
          <section className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
              Missions terminées
            </h2>

            {missionsTerminees.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {missionsTerminees.map((mission, index) => (
                  <MissionTermineeCard
                    key={mission.id}
                    mission={mission}
                    etudiant={etudiantsParMission[mission.id]}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucune mission terminée"
                description="Vous n'avez pas encore de mission complétée."
                actionText="Proposer une mission"
                actionHref="/proposer-une-mission"
              />
            )}
          </section>
        </div>
      </div>

      <CandidaturesModal
        visible={modalVisible}
        utilisateurs={utilisateursCandidats}
        onClose={() => setModalVisible(false)}
        onClickProfil={handleAfficherProfil}
        onAccepter={handleAccepter}
        onRefuser={handleRefuser}
        missionTitle={missionsCandidature.find((m) => m.id === missionEnCoursId)?.titre}
      />

      {profilUserId && <ModalProfil userId={profilUserId} onClose={() => setProfilUserId(null)} />}
    </DashboardLayout>
  )
}

function StatCard({
  icon,
  title,
  value,
  description,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: number
  description: string
  color: string
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-md text-white" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="text-3xl font-medium text-gray-900">{value}</div>
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
  status: "en-cours"
  onViewDetails: (id: string) => void
  index: number
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{mission.titre}</h3>
        <div className="bg-[#52c1ff] text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
          <Clock className="w-3 h-3" />
          En cours
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{mission.description}</p>

      {/* Compétences */}
      {mission.competences && mission.competences.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {mission.competences.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
              {skill}
            </span>
          ))}
          {mission.competences.length > 3 && (
            <span className="text-xs text-gray-400">+{mission.competences.length - 3}</span>
          )}
        </div>
      )}

      {/* Action button */}
      <button
        onClick={() => onViewDetails(mission.id)}
        className="w-full bg-white border border-[#52c1ff] text-[#52c1ff] hover:bg-[#52c1ff] hover:text-white py-2 rounded-md text-sm transition-all duration-300 flex items-center justify-center gap-2"
      >
        Voir les détails
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

function MissionCandidatureCard({
  mission,
  candidatureCount,
  onViewDetails,
  index,
}: {
  mission: Mission
  candidatureCount: number
  onViewDetails: (id: string) => void
  index: number
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{mission.titre}</h3>
        <div className="bg-[#ffbb88] text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
          <Target className="w-3 h-3" />
          Candidature
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{mission.description}</p>

      {/* Compétences */}
      {mission.competences && mission.competences.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {mission.competences.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full bg-[#ffbb88] text-whites">
              {skill}
            </span>
          ))}
          {mission.competences.length > 3 && (
            <span className="text-xs text-gray-400">+{mission.competences.length - 3}</span>
          )}
        </div>
      )}

      {/* Candidatures */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#ffbb88]" />
          <span className="font-medium text-gray-900">{candidatureCount}</span>
        </div>
        <span className="text-sm text-gray-600">
          {candidatureCount === 0
            ? "Aucune candidature"
            : candidatureCount === 1
              ? "1 candidature"
              : `${candidatureCount} candidatures`}
        </span>
      </div>

      {/* Action button */}
      <button
        onClick={() => onViewDetails(mission.id)}
        className="w-full bg-white border border-[#ffbb88] text-[#ffbb88] hover:bg-[#ffbb88] hover:text-white py-2 rounded-md text-sm transition-all duration-300 flex items-center justify-center gap-2"
      >
        Voir les candidatures
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

function MissionTermineeCard({
  mission,
  etudiant,
  index,
}: {
  mission: Mission
  etudiant?: Utilisateur
  index: number
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{mission.titre}</h3>
        <div className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          Terminée
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{mission.description}</p>

      {/* Étudiant */}
      {etudiant ? (
        <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
          <img
            src={etudiant.avatar || "/placeholder.svg?height=40&width=40"}
            alt={etudiant.nom}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-gray-900 text-sm">{etudiant.nom}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <User className="w-3 h-3" />
              Freelance
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">Aucun freelance associé</p>
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
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-10 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">🚀</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">{description}</p>
      <a
        href={actionHref}
        className="inline-flex items-center gap-2 bg-white border border-[#52c1ff] text-[#52c1ff] hover:bg-[#52c1ff] hover:text-white px-4 py-2 rounded-md text-sm transition-all duration-300"
      >
        {actionText}
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  )
}
