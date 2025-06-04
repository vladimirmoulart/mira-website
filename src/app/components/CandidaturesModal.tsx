"use client"

import type React from "react"

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#52c1ff] rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-gray-900">Candidatures</h2>
                {missionTitle && <p className="text-sm text-gray-500 mt-1">{missionTitle}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4">
            <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-100 inline-block">
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
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#52c1ff]" />
                <p className="text-gray-500 text-sm">Chargement des candidatures...</p>
              </div>
            </div>
          ) : utilisateurs.length > 0 ? (
            <div className="space-y-4">
              {utilisateurs.map((utilisateur) => {
                const avatar = utilisateur.avatar || "/placeholder.svg?height=60&width=60"

                return (
                  <div
                    key={utilisateur.id}
                    onClick={() => onClickProfil(utilisateur)}
                    className="group cursor-pointer bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={avatar || "/placeholder.svg"}
                          alt={utilisateur.nom}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900 group-hover:text-[#52c1ff] transition-colors">
                            {utilisateur.nom}
                          </h3>
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-[#ffbb88] text-white">
                            Freelance
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
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

                        <div className="flex items-center gap-4">
                          {utilisateur.note && (
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-500" />
                              <span className="text-xs font-medium text-gray-700">{utilisateur.note}/5</span>
                            </div>
                          )}
                          {utilisateur.experience && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600 truncate">{utilisateur.experience}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#52c1ff] transition-colors" />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRefuser(utilisateur)
                        }}
                        className="px-4 py-2 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                      >
                        Refuser
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onAccepter(utilisateur)
                        }}
                        className="px-4 py-2 text-sm rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors"
                      >
                        Accepter
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune candidature</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                Aucun freelance n'a encore postulé pour cette mission. Les candidatures apparaîtront ici dès qu'elles
                seront reçues.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 max-w-md mx-auto">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Conseil</h4>
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
