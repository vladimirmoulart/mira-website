"use client"

import type React from "react"
import Navbar from "@/app/components/Navbar"
import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"
import { useRouter } from "next/navigation"
import { CheckCircle, Clock, Users, ArrowRight, Loader2, Building2, FileText, Target, Award, User } from "lucide-react"
import CandidaturesModal, { Utilisateur as UtilisateurType } from "../../components/CandidaturesModal"
import ModalProfil from "../../components/ModalProfil"
*

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

  useEffect(() => {
  const fetchMissions = async () => {
    try {
      // Étape 1 : Récupérer la session utilisateur
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      console.log(session)

      if (sessionError || !session?.user) {
        console.error("Erreur de session:", sessionError)
        setLoading(false)
        return
      }

      const user = session.user

      // Étape 2 : Récupérer l'utilisateur depuis la table 'utilisateurs'
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

      // Étape 3 : Récupérer les missions créées par cet utilisateur
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

      // Comptage des candidatures
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

      // Étudiants liés aux missions terminées
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
}, [])


  const handleVoirDetails = (id: string) => {
    router.push(`/mes-projets/${id}`)
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
    const { data: users } = await supabase
      .from("utilisateurs")
      .select("id, nom, avatar, email")
      .in("id", userIds)

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
      <Navbar>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#ffbb88]" />
            <p className="text-gray-600">Chargement de vos projets...</p>
          </div>
        </div>
      </Navbar>
    )
  }

  const totalMissions = missionsEnCours.length + missionsCandidature.length + missionsTerminees.length
  const totalCandidatures = Object.values(postulationsParMission).reduce((sum, count) => sum + count, 0)

  return (
    <Navbar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-8 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header avec statistiques */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-bold bg-[#ffbb88] bg-clip-text text-transparent">
                  Mes Projets
                </h1>
                <p className="text-gray-600 mt-2">Gérez et suivez l'avancement de vos missions</p>
              </div>
              <button
                onClick={handleCreerMission}
                className="bg-gradient-to-r from-[#ffbb88] to-[#ffbb88]/80 hover:from-[#ffbb88]/90 hover:to-[#ffbb88]/70 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Proposer une nouvelle mission
              </button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                icon={<Building2 className="w-6 h-6" />}
                title="Total"
                value={totalMissions}
                description="Toutes missions"
                gradient="from-[#ffbb88] to-[#ffbb88]/80"
              />
              <StatCard
                icon={<Clock className="w-6 h-6" />}
                title="En cours"
                value={missionsEnCours.length}
                description="Missions actives"
                gradient="from-[#52c1ff] to-[#52c1ff]/80"
              />
              <StatCard
                icon={<Users className="w-6 h-6" />}
                title="Candidatures"
                value={totalCandidatures}
                description="Candidats reçus"
                gradient="from-purple-500 to-pink-500"
              />
              <StatCard
                icon={<CheckCircle className="w-6 h-6" />}
                title="Terminées"
                value={missionsTerminees.length}
                description="Missions complétées"
                gradient="from-green-500 to-emerald-500"
              />
            </div>
          </div>

          {/* Missions en cours */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-[#52c1ff] to-[#52c1ff]/80 rounded-2xl">
                <Clock className="w-6 h-6 text-white" />
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
                icon="🚀"
                title="Aucune mission en cours"
                description="Vous n'avez pas de mission active pour le moment."
                actionText="Proposer une mission"
                actionHref="/proposer-une-mission"
              />
            )}
          </section>

          {/* Missions en candidature */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-[#ffbb88] to-[#ffbb88]/80 rounded-2xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">En phase de candidature</h2>
                <p className="text-gray-600 text-sm">Missions pour lesquelles vous recevez des candidatures</p>
              </div>
            </div>

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
                icon="📝"
                title="Aucune mission en phase de candidature"
                description="Vous n'avez pas de mission en attente de candidats."
                actionText="Proposer une mission"
                actionHref="/proposer-une-mission"
              />
            )}
          </section>

          {/* Missions terminées */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Missions terminées</h2>
                <p className="text-gray-600 text-sm">Projets complétés avec succès</p>
              </div>
            </div>

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
                icon="🏆"
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
  missionTitle={
    missionsCandidature.find((m) => m.id === missionEnCoursId)?.titre
  }
/>


            {profilUserId && (
  <ModalProfil
    userId={profilUserId}
    onClose={() => setProfilUserId(null)}
  />
)}

    </Navbar>
  )
}

function StatCard({
  icon,
  title,
  value,
  description,
  gradient,
}: {
  icon: React.ReactNode
  title: string
  value: number
  description: string
  gradient: string
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
  status: "en-cours"
  onViewDetails: (id: string) => void
  index: number
}) {
  const gradients = [
    "from-[#52c1ff]/10 to-[#52c1ff]/5",
    "from-[#ffbb88]/10 to-[#ffbb88]/5",
    "from-purple-500/10 to-purple-500/5",
  ]

  const borderColors = ["border-[#52c1ff]/20", "border-[#ffbb88]/20", "border-purple-500/20"]

  return (
    <div
      className={`bg-gradient-to-br ${gradients[index % 3]} border ${
        borderColors[index % 3]
      } rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#52c1ff] transition-colors line-clamp-2">
          {mission.titre}
        </h3>
        <div className="bg-gradient-to-r from-[#52c1ff] to-[#52c1ff]/80 text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
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
            <span key={i} className="text-xs font-medium px-3 py-1 rounded-full bg-[#52c1ff]/20 text-[#52c1ff]">
              {skill}
            </span>
          ))}
          {mission.competences.length > 3 && (
            <span className="text-xs text-gray-500 px-2 py-1">+{mission.competences.length - 3}</span>
          )}
        </div>
      )}

      {/* Action button */}
      <button
        onClick={() => onViewDetails(mission.id)}
        className="w-full bg-[#52c1ff] hover:from-[#52c1ff]/90 hover:to-[#ffbb88]/90 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn"
      >
        Voir les détails
        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
  const gradients = [
    "from-[#ffbb88]/10 to-[#ffbb88]/5",
    "from-[#52c1ff]/10 to-[#52c1ff]/5",
    "from-purple-500/10 to-purple-500/5",
  ]

  const borderColors = ["border-[#ffbb88]/20", "border-[#52c1ff]/20", "border-purple-500/20"]

  return (
    <div
      className={`bg-gradient-to-br ${gradients[index % 3]} border ${
        borderColors[index % 3]
      } rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#ffbb88] transition-colors line-clamp-2">
          {mission.titre}
        </h3>
        <div className="bg-gradient-to-r from-[#ffbb88] to-[#ffbb88]/80 text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
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
            <span key={i} className="text-xs font-medium px-3 py-1 rounded-full bg-[#ffbb88]/20 text-[#ffbb88]">
              {skill}
            </span>
          ))}
          {mission.competences.length > 3 && (
            <span className="text-xs text-gray-500 px-2 py-1">+{mission.competences.length - 3}</span>
          )}
        </div>
      )}

      {/* Candidatures */}
      <div className="bg-white/50 rounded-xl p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#ffbb88]" />
          <span className="font-semibold text-gray-900">{candidatureCount}</span>
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
        className="w-full bg-[#ffbb88] hover:from-[#ffbb88]/90 hover:to-[#52c1ff]/90 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn"
      >
        Voir les candidatures
        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
  const gradients = [
    "from-green-500/10 to-emerald-500/5",
    "from-emerald-500/10 to-green-500/5",
    "from-teal-500/10 to-green-500/5",
  ]

  const borderColors = ["border-green-500/20", "border-emerald-500/20", "border-teal-500/20"]

  return (
    <div
      className={`bg-gradient-to-br ${gradients[index % 3]} border ${
        borderColors[index % 3]
      } rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
          {mission.titre}
        </h3>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          Terminée
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{mission.description}</p>
      

      {/* Étudiant */}
      {etudiant ? (
        <div className="bg-white/50 rounded-xl p-4 flex items-center gap-3">
          <div className="relative">
            <img
              src={etudiant.avatar || "/placeholder.svg?height=40&width=40"}
              alt={etudiant.nom}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{etudiant.nom}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <User className="w-3 h-3" />
              Freelance
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Aucun freelance associé</p>
        </div>
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
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-12 text-center">
      <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      <a
        href={actionHref}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ffbb88] to-[#52c1ff] hover:from-[#ffbb88]/90 hover:to-[#52c1ff]/90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
      >
        {actionText}
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  )
}

const handleAccepter = async (utilisateur: UtilisateurType) => {
  if (!missionEnCoursId) return
  await supabase
    .from("postulations")
    .update({ statut: "acceptée" })
    .eq("id_utilisateur", utilisateur.id)
    .eq("id_mission", missionEnCoursId)
}

const handleRefuser = async (utilisateur: UtilisateurType) => {
  if (!missionEnCoursId) return
  await supabase
    .from("postulations")
    .update({ statut: "refusée" })
    .eq("id_utilisateur", utilisateur.id)
    .eq("id_mission", missionEnCoursId)
}


