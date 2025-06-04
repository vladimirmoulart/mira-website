"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"
import DashboardLayout from "@/app/components/nav/DashboardLayout"
import {
  Search,
  Filter,
  Star,
  ExternalLink,
  Mail,
  MapPin,
  Award,
  Briefcase,
  Loader2,
  Users,
  Target,
} from "lucide-react"
import { FaLinkedin, FaGlobe } from "react-icons/fa"

interface Talent {
  id: string
  name: string
  domaine: string
  skills: string[]
  imageUrl: string
  linkedinUrl?: string
  portfolioUrl?: string
  rating: number
  email: string
  localisation?: string
  experience?: string
  projets_realises?: number
  disponibilite?: string
}

export default function RechercherUnTalentPage() {
  const [talents, setTalents] = useState<Talent[]>([])
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([])
  const [search, setSearch] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("")
  const [selectedSkill, setSelectedSkill] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null)

  // Récupérer tous les domaines et compétences uniques
  const allDomains = Array.from(new Set(talents.map((talent) => talent.domaine).filter(Boolean)))
  const allSkills = Array.from(new Set(talents.flatMap((talent) => talent.skills || [])))

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        const { data: etudiants, error } = await supabase
          .from("etudiants")
          .select("*, utilisateurs (id, nom, email, avatar)")

        if (error) {
          console.error("Erreur lors de la récupération des talents :", error)
          return
        }

        const talentsData = etudiants.map((etudiant, i) => ({
          id: etudiant.utilisateurs?.id || `talent-${i}`,
          name: etudiant.utilisateurs?.nom || "Nom non disponible",
          domaine: etudiant.domaine || "Domaine non spécifié",
          skills: etudiant.competences || [],
          imageUrl: etudiant.utilisateurs?.avatar || `/placeholder.svg?height=300&width=300`,
          linkedinUrl: etudiant.linkedin || undefined,
          portfolioUrl: etudiant.portfolio || undefined,
          rating: 4.2 + Math.random() * 0.8, // Note aléatoire entre 4.2 et 5.0
          email: etudiant.utilisateurs?.email || "",
          localisation: etudiant.localisation,
          experience: etudiant.experience,
          projets_realises: etudiant.projets_realises || Math.floor(Math.random() * 15) + 1,
          disponibilite: etudiant.disponibilite,
        }))

        setTalents(talentsData)
        setFilteredTalents(talentsData)
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTalents()
  }, [])

  // Filtrage des talents
  useEffect(() => {
    let filtered = talents

    if (search) {
      filtered = filtered.filter(
        (talent) =>
          talent.name.toLowerCase().includes(search.toLowerCase()) ||
          talent.domaine?.toLowerCase().includes(search.toLowerCase()) ||
          talent.skills.some((skill) => skill.toLowerCase().includes(search.toLowerCase())),
      )
    }

    if (selectedDomain) {
      filtered = filtered.filter((talent) => talent.domaine === selectedDomain)
    }

    if (selectedSkill) {
      filtered = filtered.filter((talent) => talent.skills.includes(selectedSkill))
    }

    setFilteredTalents(filtered)
  }, [search, selectedDomain, selectedSkill, talents])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#52c1ff]" />
            <p className="text-gray-600">Chargement des talents...</p>
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
                    Rechercher un talent 
                  </h1>
                  {/* Subtitle with better styling */}
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                    <h3 className="text-lg font-medium text-gray-600 leading-relaxed">
                      Découvrez des profils qualifiés et passionnés pour donner vie à vos projets 
                    </h3>
                  </div>
                  {/* Optional: Add a subtle animation line */}
                  <div className="w-24 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-60"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              title="Talents disponibles"
              value={talents.length}
              gradient="from-[#52c1ff] to-[#52c1ff]/80"
            />
            <StatCard
              icon={<Target className="w-6 h-6" />}
              title="Domaines d'expertise"
              value={allDomains.length}
              gradient="from-[#ffbb88] to-[#ffbb88]/80"
            />
            <StatCard
              icon={<Award className="w-6 h-6" />}
              title="Compétences"
              value={allSkills.length}
              gradient="from-purple-500 to-pink-500"
            />
          </div>

          {/* Filtres et recherche */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Barre de recherche */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, domaine ou compétence..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Filtre par domaine */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent outline-none transition-all appearance-none bg-white"
                >
                  <option value="">Tous les domaines</option>
                  {allDomains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par compétence */}
              <div className="relative">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
            </div>

            {/* Résultats */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {filteredTalents.length} talent{filteredTalents.length !== 1 ? "s" : ""} trouvé
                {filteredTalents.length !== 1 ? "s" : ""}
              </span>
              {(search || selectedDomain || selectedSkill) && (
                <button
                  onClick={() => {
                    setSearch("")
                    setSelectedDomain("")
                    setSelectedSkill("")
                  }}
                  className="text-sm text-[#52c1ff] hover:text-[#ffbb88] transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {/* Grille des talents */}
          {filteredTalents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTalents.map((talent, index) => (
                <TalentCard 
                key={talent.id} 
                talent={talent} 
                index={index} />
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun talent trouvé</h3>
              <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche</p>
              <button
                onClick={() => {
                  setSearch("")
                  setSelectedDomain("")
                  setSelectedSkill("")
                }}
                className="bg-gradient-to-r from-[#52c1ff] to-[#ffbb88] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Voir tous les talents
              </button>
            </div>
          )}
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
}: {
  icon: React.ReactNode
  title: string
  value: number
  gradient: string
}) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 bg-gradient-to-r ${gradient} rounded-xl text-white`}>{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

function TalentCard({ talent, index }: { talent: Talent; index: number }) {
  const gradients = [
    "from-[#52c1ff]/10 to-[#52c1ff]/5",
    "from-[#ffbb88]/10 to-[#ffbb88]/5",
    "from-purple-500/10 to-purple-500/5",
    "from-green-500/10 to-green-500/5",
  ]

  const borderColors = ["border-[#52c1ff]/20", "border-[#ffbb88]/20", "border-purple-500/20", "border-green-500/20"]

  return (
    <div
      className={`bg-gradient-to-br ${gradients[index % 4]} border ${
        borderColors[index % 4]
      } rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group`}
    >
      {/* Image et rating */}
      <div className="relative">
        <img
          src={talent.imageUrl || "/placeholder.svg"}
          alt={talent.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm font-semibold text-gray-800">{talent.rating.toFixed(1)}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Contenu */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#52c1ff] transition-colors">
            {talent.name}
          </h3>
          <p className="text-[#ffbb88] font-semibold">{talent.domaine}</p>
        </div>


        {/* Compétences */}
        {talent.skills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Compétences</h4>
            <div className="flex flex-wrap gap-2">
              {talent.skills.slice(0, 4).map((skill, i) => (
                <span
                  key={i}
                  className="text-xs font-medium px-3 py-1 rounded-full bg-white/80 text-gray-700 border border-gray-200"
                >
                  {skill}
                </span>
              ))}
              {talent.skills.length > 4 && (
                <span className="text-xs text-gray-500 px-2 py-1">+{talent.skills.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Informations supplémentaires */}
        <div className="space-y-2">
          {talent.localisation && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{talent.localisation}</span>
            </div>
          )}
          {talent.experience && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="w-4 h-4" />
              <span>{talent.experience}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200/50">
          <a
            href={`mailto:${talent.email}`}
            className="flex items-center justify-center p-3 rounded-xl bg-white/50 hover:bg-white/80 text-gray-600 hover:text-[#52c1ff] transition-all group/btn"
            title="Envoyer un email"
          >
            <Mail className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          </a>
          {talent.linkedinUrl && (
            <a
              href={talent.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 rounded-xl bg-white/50 hover:bg-white/80 text-gray-600 hover:text-[#52c1ff] transition-all group/btn"
              title="Voir le profil LinkedIn"
            >
              <FaLinkedin className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            </a>
          )}
          {talent.portfolioUrl && (
            <a
              href={talent.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 rounded-xl bg-white/50 hover:bg-white/80 text-gray-600 hover:text-[#52c1ff] transition-all group/btn"
              title="Voir le portfolio"
            >
              <FaGlobe className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            </a>
          )}
        </div>

      </div>
    </div>
  )
}
