"use client"

import DashboardLayout from "@/app/components/nav/DashboardLayout"
import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"
import {
  Mail,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react"
import { FaLinkedin } from "react-icons/fa"
import ModalProfil from "../../components/ModalProfil"
import { useNotification } from "@/app/components/Notifications"

interface Mission {
  id: number
  titre: string
  description: string
  duree: string
  budget: number
  competences: string[]
  id_entreprise: string
  localisation?: string
  niveau?: string
  date_limite?: string
  type_contrat?: string
  statut?: string
}

interface Utilisateur {
  id: string
  nom: string
  email: string
  avatar?: string
  linkedin?: string
  role: number
}

export default function RechercherMission() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [filteredMissions, setFilteredMissions] = useState<Mission[]>([])
  const [utilisateurs, setUtilisateurs] = useState<Record<string, Utilisateur>>({})
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSkill, setSelectedSkill] = useState("")
  const [mesPostulations, setMesPostulations] = useState<Record<number, "acceptée" | "refusée" | "en_attente">>({})
  const [isSubmitting, setIsSubmitting] = useState<Record<number, boolean>>({})
  const { showNotification, Notification } = useNotification()

  const allSkills = Array.from(new Set(missions.flatMap((mission) => mission.competences || [])))

  // Apply filters whenever search term or selected skill changes
  useEffect(() => {
    const filtered = missions.filter((mission) => {
      const matchesSearch =
        searchTerm === "" ||
        mission.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSkill = selectedSkill === "" || (mission.competences && mission.competences.includes(selectedSkill))

      return matchesSearch && matchesSkill
    })

    setFilteredMissions(filtered)
  }, [missions, searchTerm, selectedSkill])

  useEffect(() => {
    const fetchPostulations = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: postulationsData, error } = await supabase
        .from("postulations")
        .select("id_mission, statut")
        .eq("id_utilisateur", user.id)

      if (error) {
        console.error("Erreur de récupération des postulations :", error)
        return
      }

      const statusMap: Record<number, "acceptée" | "en_attente" | "refusée"> = {}
      postulationsData.forEach((p) => {
        statusMap[p.id_mission] = p.statut
      })

      setMesPostulations(statusMap)
    }

    fetchPostulations()
  }, [missions])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: missionsData, error: missionsError } = await supabase.from("missions").select("*")
        if (missionsError) {
          console.error("Erreur de récupération des missions :", missionsError)
          showNotification("Erreur lors du chargement des missions", "error")
          return
        }

        const entrepriseIds = [...new Set(missionsData.map((m) => m.id_entreprise))]
        const { data: utilisateursData, error: utilisateursError } = await supabase
          .from("utilisateurs")
          .select("*")
          .in("id", entrepriseIds)

        if (utilisateursError) {
          console.error("Erreur de récupération des utilisateurs :", utilisateursError)
          showNotification("Erreur lors du chargement des entreprises", "error")
          return
        }

        const utilisateurMap: Record<string, Utilisateur> = {}
        utilisateursData.forEach((e: Utilisateur) => {
          utilisateurMap[e.id] = e
        })

        setMissions(missionsData)
        setFilteredMissions(missionsData)
        setUtilisateurs(utilisateurMap)
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
        showNotification("Une erreur est survenue", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [showNotification])

  const handlePostuler = async (mission: Mission) => {
    try {
      setIsSubmitting((prev) => ({ ...prev, [mission.id]: true }))

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        showNotification("Vous devez être connecté pour postuler.", "error")
        return
      }

      const { data: existingApplication } = await supabase
        .from("postulations")
        .select("*")
        .eq("id_utilisateur", user.id)
        .eq("id_mission", mission.id)
        .single()

      if (existingApplication) {
        showNotification("Vous avez déjà postulé à cette mission.", "info")
        return
      }

      const { error } = await supabase.from("postulations").insert({
        id_utilisateur: user.id,
        id_mission: mission.id,
        statut: "en_attente",
        date_postulation: new Date().toISOString(),
      })

      if (error) {
        console.error("Erreur lors de la postulation:", error)
        showNotification("Une erreur est survenue lors de la postulation.", "error")
        return
      }

      setMesPostulations((prev) => ({
        ...prev,
        [mission.id]: "en_attente",
      }))

      showNotification("Votre candidature a été envoyée avec succès!", "success")
    } catch (error) {
      console.error("Erreur:", error)
      showNotification("Une erreur est survenue lors de la postulation.", "error")
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [mission.id]: false }))
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedSkill("")
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#52c1ff]" />
            <p className="text-gray-600">Chargement des missions...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const displayedMissions = filteredMissions.filter(
    (mission) => mission.statut !== "terminée" && mesPostulations[mission.id] !== "acceptée",
  )

  return (
    <DashboardLayout>
      {Notification}
      <div className="min-h-screen bg-white py-8 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Rechercher une mission</h1>
                <p className="text-gray-600">Découvrez des opportunités qui correspondent à vos compétences</p>
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par titre ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Filtre par compétence */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent outline-none transition-all appearance-none bg-white"
                >
                  <option value="">Toutes les compétences</option>
                  {allSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statistiques et réinitialisation */}
              <div className="flex items-center justify-between lg:justify-end gap-3">
                {(searchTerm || selectedSkill) && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser
                  </button>
                )}
                <div className="bg-[#52c1ff] rounded-lg px-4 py-2">
                  <span className="text-sm font-medium text-white">
                    {displayedMissions.length} mission{displayedMissions.length !== 1 ? "s" : ""} trouvée
                    {displayedMissions.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Filtres actifs */}
            {(searchTerm || selectedSkill) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchTerm && (
                  <div className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-lg">
                    <span>Recherche: {searchTerm}</span>
                    <button onClick={() => setSearchTerm("")} className="ml-1 text-gray-500 hover:text-gray-700">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {selectedSkill && (
                  <div className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-lg">
                    <span>Compétence: {selectedSkill}</span>
                    <button onClick={() => setSelectedSkill("")} className="ml-1 text-gray-500 hover:text-gray-700">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grille des missions */}
          {displayedMissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedMissions.map((mission, index) => {
                const utilisateur = utilisateurs[mission.id_entreprise]
                return (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    utilisateur={utilisateur}
                    onPostuler={handlePostuler}
                    onViewProfile={setSelectedUserId}
                    index={index}
                    postulationStatus={mesPostulations[mission.id]}
                    isSubmitting={isSubmitting[mission.id] || false}
                  />
                )
              })}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune mission trouvée</h3>
              <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche</p>
              <button
                onClick={resetFilters}
                className="bg-[#52c1ff] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#52c1ff]/90 transition-all"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedUserId && <ModalProfil userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}
    </DashboardLayout>
  )
}

function MissionCard({
  mission,
  utilisateur,
  onPostuler,
  onViewProfile,
  postulationStatus,
  index,
  isSubmitting,
}: {
  mission: Mission
  utilisateur?: Utilisateur
  onPostuler: (mission: Mission) => void
  onViewProfile: (userId: string) => void
  postulationStatus?: "acceptée" | "refusée" | "en_attente"
  index: number
  isSubmitting: boolean
}) {
  const isDisabled = !!postulationStatus || isSubmitting

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all duration-300">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 hover:text-[#52c1ff] transition-colors mb-2">
            {mission.titre}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{mission.description}</p>
        </div>

        {/* Informations de la mission */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{mission.duree}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>{mission.budget}€</span>
          </div>
          {mission.localisation && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{mission.localisation}</span>
            </div>
          )}
          {mission.date_limite && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Jusqu'au {new Date(mission.date_limite).toLocaleDateString("fr-FR")}</span>
            </div>
          )}
        </div>

        {/* Compétences */}
        {mission.competences && mission.competences.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mission.competences.slice(0, 4).map((skill, i) => (
              <span key={i} className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                {skill}
              </span>
            ))}
            {mission.competences.length > 4 && (
              <span className="text-xs text-gray-500 px-2 py-1">+{mission.competences.length - 4}</span>
            )}
          </div>
        )}

        {/* Séparateur */}
        <div className="border-t border-gray-200"></div>

        {/* Profil de l'entreprise */}
        {utilisateur && (
          <div
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer"
            onClick={() => onViewProfile(utilisateur.id)}
          >
            <img
              src={utilisateur.avatar || "/placeholder.svg?height=40&width=40"}
              alt={utilisateur.nom}
              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{utilisateur.nom}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Building2 className="w-3 h-3" />
                Entreprise
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
        )}

        {/* Actions */}
        {utilisateur && (
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`mailto:${utilisateur.email}`}
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#52c1ff] transition-all text-sm font-medium"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
            <a
              href={utilisateur.linkedin || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#52c1ff] transition-all text-sm font-medium"
            >
              <FaLinkedin className="w-4 h-4" />
              LinkedIn
            </a>
          </div>
        )}

        {/* Bouton postuler */}
        <button
          onClick={() => onPostuler(mission)}
          disabled={isDisabled}
          className={`w-full py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            postulationStatus === "acceptée"
              ? "bg-green-500 text-white"
              : postulationStatus === "refusée"
                ? "bg-red-500 text-white"
                : postulationStatus === "en_attente"
                  ? "bg-yellow-400 text-white"
                  : isSubmitting
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#52c1ff] hover:bg-[#52c1ff]/90 text-white"
          }`}
        >
          {postulationStatus === "acceptée" && (
            <>
              <CheckCircle className="w-4 h-4" />
              Candidature acceptée
            </>
          )}
          {postulationStatus === "refusée" && (
            <>
              <AlertCircle className="w-4 h-4" />
              Candidature refusée
            </>
          )}
          {postulationStatus === "en_attente" && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Candidature en attente
            </>
          )}
          {!postulationStatus && isSubmitting && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Envoi en cours...
            </>
          )}
          {!postulationStatus && !isSubmitting && <>Postuler</>}
        </button>
      </div>
    </div>
  )
}
