"use client"

import { Users, X, Mail, User, ExternalLink, Award, Calendar, Loader2 } from "lucide-react"

export interface Utilisateur {
  id: string
  nom: string
  avatar?: string
  email?: string
  role?: number
  date_postulation?: string
  experience?: string
  note?: number
}

export default function CandidaturesModal({
  visible,
  utilisateurs,
  onClose,
  onClickProfil,
  onAccepter,
  onRefuser,
  loading = false,
  missionTitle,
}: {
  visible: boolean
  utilisateurs: Utilisateur[]
  onClose: () => void
  onClickProfil: (utilisateur: Utilisateur) => void
  onAccepter: (utilisateur: Utilisateur) => void
  onRefuser: (utilisateur: Utilisateur) => void
  loading?: boolean
  missionTitle?: string
}) {
  if (!visible) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date inconnue"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getRoleLabel = (role?: number) => {
    switch (role) {
      default:
        return { label: "Freelance", color: "text-[#52c1ff]", bg: "bg-[#52c1ff]/10", border: "border-[#52c1ff]/20" }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#52c1ff]/10 to-[#ffbb88]/10 border-b border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-[#52c1ff] to-[#ffbb88] rounded-2xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#52c1ff] to-[#ffbb88] bg-clip-text text-transparent">
                  Candidatures
                </h2>
                {missionTitle && <p className="text-sm text-gray-600 mt-1">{missionTitle}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-all shadow-sm"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-4">
            <div className="bg-white/50 rounded-xl px-4 py-2 border border-white/20">
              <span className="text-sm font-medium text-gray-700">
                {utilisateurs.length} candidature{utilisateurs.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#52c1ff]" />
                <p className="text-gray-600">Chargement des candidatures...</p>
              </div>
            </div>
          ) : utilisateurs.length > 0 ? (
            <div className="space-y-4">
              {utilisateurs.map((utilisateur) => {
                const roleInfo = getRoleLabel(utilisateur.role)
                const avatar = utilisateur.avatar || "/placeholder.svg?height=60&width=60"

                return (
                  <div
                    key={utilisateur.id}
                    onClick={() => onClickProfil(utilisateur)}
                    className="group cursor-pointer bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:shadow-xl hover:border-[#52c1ff]/30 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={avatar}
                          alt={utilisateur.nom}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-lg group-hover:ring-[#52c1ff]/50 transition-all duration-300"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#52c1ff] to-[#ffbb88] rounded-full border-2 border-white"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-[#52c1ff] transition-colors">
                            {utilisateur.nom}
                          </h3>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${roleInfo.bg} ${roleInfo.color} ${roleInfo.border} border`}
                          >
                            {roleInfo.label}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {utilisateur.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{utilisateur.email}</span>
                            </div>
                          )}
                          {utilisateur.date_postulation && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(utilisateur.date_postulation)}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-4">
                          {utilisateur.note && (
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs font-medium text-gray-700">{utilisateur.note}/5</span>
                            </div>
                          )}
                          {utilisateur.experience && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600 truncate">{utilisateur.experience}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#52c1ff] transition-colors" />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRefuser(utilisateur)
                        }}
                        className="px-3 py-1 text-sm rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        Refuser
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onAccepter(utilisateur)
                        }}
                        className="px-3 py-1 text-sm rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                      >
                        Accepter
                      </button>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-r from-[#52c1ff]/5 to-[#ffbb88]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune candidature</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Aucun freelance n'a encore postulé pour cette mission. Les candidatures apparaîtront ici dès qu'elles
                seront reçues.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 max-w-md mx-auto">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Conseil</h4>
                <p className="text-xs text-blue-700">
                  Assurez-vous que votre mission soit bien détaillée et attractive pour attirer plus de candidats.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
