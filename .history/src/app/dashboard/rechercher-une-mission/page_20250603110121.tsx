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
} from "lucide-react"
import { FaLinkedin } from "react-icons/fa"
import ModalProfil from "../../components/ModalProfil"

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

  const allSkills = Array.from(new Set(missions.flatMap((mission) => mission.competences || [])))
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
          return
        }

        const entrepriseIds = [...new Set(missionsData.map((m) => m.id_entreprise))]
        const { data: utilisateursData, error: utilisateursError } = await supabase
          .from("utilisateurs")
          .select("*")
          .in("id", entrepriseIds)

        if (utilisateursError) {
          console.error("Erreur de récupération des utilisateurs :", utilisateursError)
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
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtrage des missions
  useEffect(() => {
    let filtered = missions

    if (searchTerm) {
      filtered = filtered.filter(
        (mission) =>
          mission.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mission.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedSkill) {
      filtered = filtered.filter((mission) => mission.competences?.includes(selectedSkill))
    }

    setFilteredMissions(filtered)
  }, [searchTerm, selectedSkill, missions])

  const handlePostuler = async (mission: Mission) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Vous devez être connecté pour postuler.")
        return
      }

      // Vérifier si l'utilisateur a déjà postulé
      const { data: existingApplication } = await supabase
        .from("postulations")
        .select("*")
        .eq("id_utilisateur", user.id)
        .eq("id_mission", mission.id)
        .single()

      if (existingApplication) {
        alert("Vous avez déjà postulé à cette mission.")
        return
      }

      // Créer une nouvelle postulation
      const { error } = await supabase.from("postulations").insert({
        id_utilisateur: user.id,
        id_mission: mission.id,
        statut: "en_attente",
        date_postulation: new Date().toISOString(),
      })

      if (error) {
        console.error("Erreur lors de la postulation:", error)
        alert("Une erreur est survenue lors de la postulation.")
        return
      }

      // Mettre à jour l'état local
      setMesPostulations((prev) => ({
        ...prev,
        [mission.id]: "en_attente",
      }))

      alert("Votre candidature a été envoyée avec succès!")
    } catch (error) {
      console.error("Erreur:", error)
      alert("Une erreur est survenue lors de la postulation.")
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#52c1ff]" />
            <p className="text-gray-600">Chargement des missions...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-8 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  {/* Main icon container */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 relative overflow-hidden">
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {/* Icon */}
                    <div className="relative z-10 text-3xl group-hover:scale-110 transition-transform duration-300">
                      ✨
                    </div>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  {/* Floating particles effect */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-r from-pink-400 to-red-500 rounded-full animate-bounce"></div>
                </div>

                <div className="space-y-2">
                  {/* Main title with enhanced gradient */}
                  <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
                    Rechercher une mission
                  </h1>
                  {/* Subtitle with better styling */}
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                    <h3 className="text-lg font-medium text-gray-600 leading-relaxed">
                      Découvrez des opportunités passionnantes qui correspondent à vos compétences et aspirations
                    </h3>
                  </div>
                  {/* Optional: Add a subtle animation line */}
                  <div className="w-24 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-60"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par titre ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Filtre par compétence */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent outline-none transition-all appearance-none bg-white"
                >
                  <option value="">Toutes les compétences</option>
                  {allSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statistiques */}
              <div className="flex items-center justify-center lg:justify-end">
                <div className="bg-[#ffbb88] rounded-xl px-4 py-3">
                  <span className="text-sm font-medium text-white">
                    {filteredMissions.length} mission{filteredMissions.length !== 1 ? "s" : ""} trouvée
                    {filteredMissions.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grille des missions */}
          {filteredMissions.length > 0 ? (
            <div className="columns-1 lg:columns-2 xl:columns-3 gap-6 space-y-6">
              {filteredMissions.map((mission, index) => {
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
                  />
                )
              })}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune mission trouvée</h3>
              <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche</p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedSkill("")
                }}
                className="bg-gradient-to-r from-[#52c1ff] to-[#ffbb88] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
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
postulationStatus?: "acceptée" | "refusée" | "en_attente",  index,
}: {
  mission: Mission
  utilisateur?: Utilisateur
  onPostuler: (mission: Mission) => void
  onViewProfile: (userId: string) => void
  postulationStatus?: "acceptée" | "refusée" | "en_attente"
  index: number
}) {
  const gradients = [
    "from-[#52c1ff]/10 to-[#52c1ff]/5",
    "from-[#ffbb88]/10 to-[#ffbb88]/5",
    "from-purple-500/10 to-purple-500/5",
    "from-green-500/10 to-green-500/5",
  ]

  const borderColors = ["border-[#52c1ff]/20", "border-[#ffbb88]/20", "border-purple-500/20", "border-green-500/20"]

  return (
    <div
      className={`break-inside-avoid bg-gradient-to-br ${gradients[index % 4]} border ${
        borderColors[index % 4]
      } rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group`}
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#52c1ff] transition-colors mb-2">
            {mission.titre}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">{mission.description}</p>
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
              <span
                key={i}
                className="text-xs font-medium px-3 py-1 rounded-full bg-white/80 text-gray-700 border border-gray-200"
              >
                {skill}
              </span>
            ))}
            {mission.competences.length > 4 && (
              <span className="text-xs text-gray-500 px-2 py-1">+{mission.competences.length - 4}</span>
            )}
          </div>
        )}

        {/* Séparateur */}
        <div className="border-t border-gray-200/50"></div>

        {/* Profil de l'entreprise */}
        {utilisateur && (
          <div
            className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-all cursor-pointer group/profile"
            onClick={() => onViewProfile(utilisateur.id)}
          >
            <img
              src={utilisateur.avatar || "/placeholder.svg?height=40&width=40"}
              alt={utilisateur.nom}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm group-hover/profile:ring-[#52c1ff]/50 transition-all"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm group-hover/profile:text-[#52c1ff] transition-colors">
                {utilisateur.nom}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Building2 className="w-3 h-3" />
                Entreprise
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover/profile:text-[#52c1ff] transition-colors" />
          </div>
        )}

        {/* Actions */}
        {utilisateur && (
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`mailto:${utilisateur.email}`}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/50 hover:bg-white/80 text-gray-600 hover:text-[#52c1ff] transition-all text-sm font-medium"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
            <a
              href={utilisateur.linkedin || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/50 hover:bg-white/80 text-gray-600 hover:text-[#52c1ff] transition-all text-sm font-medium"
            >
              <FaLinkedin className="w-4 h-4" />
              LinkedIn
            </a>
          </div>
        )}

        {/* Bouton postuler */}
        {/* Bouton postuler */}
<button
  onClick={() => onPostuler(mission)}
    disabled={!!postulationStatus}
  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
  postulationStatus === "acceptée"
    ? "bg-green-500 text-white"
    : postulationStatus === "refusée"
    ? "bg-red-500 text-white"
    : postulationStatus === "en_attente"
    ? "bg-yellow-400 text-white"
    : "bg-[#52c1ff] hover:from-[#52c1ff]/90 hover:to-[#ffbb88]/90 text-white hover:shadow-lg"
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
    En attente
  </>
)}
{!postulationStatus && (
  <>
    Postuler
  </>
)}

</button>

      </div>
    </div>
  )
}
