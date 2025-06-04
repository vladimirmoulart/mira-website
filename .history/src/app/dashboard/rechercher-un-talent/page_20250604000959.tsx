"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"
import DashboardLayout from "@/app/components/nav/DashboardLayout"
import { Search, Filter, Star, Mail, MapPin, Award, Briefcase, Loader2, Users, Target } from "lucide-react"
import { FaLinkedin, FaGlobe } from "react-icons/fa"
import ModalProfil from "@/app/components/ModalProfil"

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#52c1ff]" />
            <p className="text-gray-500 text-sm">Chargement</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-medium text-gray-900">Rechercher un talent</h1>
            <p className="text-gray-500">Découvrez des profils qualifiés pour vos projets</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<Users className="w-5 h-5" />}
              title="Talents disponibles"
              value={talents.length}
              color="#52c1ff"
            />
            <StatCard
              icon={<Target className="w-5 h-5" />}
              title="Domaines d'expertise"
              value={allDomains.length}
              color="#ffbb88"
            />
            <StatCard
              icon={<Award className="w-5 h-5" />}
              title="Compétences"
              value={allSkills.length}
              color="#8b5cf6"
            />
          </div>

          {/* Filtres et recherche */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Barre de recherche */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, domaine ou compétence..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Filtre par domaine */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent outline-none transition-all appearance-none bg-white"
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
                  className="text-sm text-[#52c1ff] hover:text-[#52c1ff]/80 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {/* Grille des talents */}
          {filteredTalents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTalents.map((talent, index) => (
                <TalentCard key={talent.id} talent={talent} index={index} onClick={() => setSelectedTalent(talent)} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun talent trouvé</h3>
              <p className="text-gray-500 text-sm mb-6">Essayez de modifier vos critères de recherche</p>
              <button
                onClick={() => {
                  setSearch("")
                  setSelectedDomain("")
                  setSelectedSkill("")
                }}
                className="bg-[#52c1ff] hover:bg-[#52c1ff]/90 text-white px-5 py-2 rounded-lg font-medium transition-all duration-300"
              >
                Voir tous les talents
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedTalent && <ModalProfil userId={selectedTalent.id} onClose={() => setSelectedTalent(null)} />}
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
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-md text-white" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="text-3xl font-medium text-gray-900">{value}</div>
    </div>
  )
}

function TalentCard({ talent, index, onClick }: { talent: Talent; index: number; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer group"
    >
      {/* Image et rating */}
      <div className="relative">
        <img
          src={talent.imageUrl || "/placeholder.svg"}
          alt={talent.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          <span className="text-xs font-medium text-gray-800">{talent.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-[#52c1ff] transition-colors">
            {talent.name}
          </h3>
          <p className="text-[#ffbb88] font-medium text-sm">{talent.domaine}</p>
        </div>

        {/* Compétences */}
        {talent.skills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Compétences</h4>
            <div className="flex flex-wrap gap-2">
              {talent.skills.slice(0, 4).map((skill, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {skill}
                </span>
              ))}
              {talent.skills.length > 4 && <span className="text-xs text-gray-400">+{talent.skills.length - 4}</span>}
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
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
          <a
            href={`mailto:${talent.email}`}
            className="flex items-center justify-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#52c1ff] transition-all"
            title="Envoyer un email"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="w-4 h-4" />
          </a>
          {talent.linkedinUrl && (
            <a
              href={talent.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#52c1ff] transition-all"
              title="Voir le profil LinkedIn"
              onClick={(e) => e.stopPropagation()}
            >
              <FaLinkedin className="w-4 h-4" />
            </a>
          )}
          {talent.portfolioUrl && (
            <a
              href={talent.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#52c1ff] transition-all"
              title="Voir le portfolio"
              onClick={(e) => e.stopPropagation()}
            >
              <FaGlobe className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
