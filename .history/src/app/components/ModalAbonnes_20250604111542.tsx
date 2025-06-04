"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { X, User } from "lucide-react"

interface Abonne {
  abonne_id: string
  abonne: {
    nom: string
    avatar: string | null
  } | null
}

interface ModalAbonnesProps {
  userId: string
  onClose: () => void
}

export default function ModalAbonnes({ userId, onClose }: ModalAbonnesProps) {
  const [abonnes, setAbonnes] = useState<Abonne[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
  const fetchAbonnes = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("abonnements")
        .select("abonne_id, abonne:utilisateurs!abonne_id(nom, avatar)")
        .eq("abonnement_id", userId)

      if (error) throw error

      // 🔁 Adapter le format des données Supabase au type Abonne[]
      const abonnesFormates: Abonne[] = (data || []).map((item: {
        abonne_id: string;
        abonne: { nom: string; avatar: string | null }[];
      }) => ({
        abonne_id: item.abonne_id,
        abonne: item.abonne?.[0] || null, // on prend le premier utilisateur lié
      }))

      setAbonnes(abonnesFormates)
    } catch (err) {
      setError("Erreur lors du chargement des abonnés")
      console.error("Error fetching abonnés:", err)
    } finally {
      setLoading(false)
    }
  }

  fetchAbonnes()
}, [userId])


  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#52c1ff] rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900">Abonnés</h2>
              {!loading && (
                <p className="text-sm text-gray-500">
                  {abonnes.length} abonné{abonnes.length !== 1 ? "s" : ""}
                </p>
              )}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#52c1ff] text-white rounded-lg hover:bg-[#52c1ff]/90 transition-colors text-sm"
              >
                Réessayer
              </button>
            </div>
          ) : abonnes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun abonné</h3>
              <p className="text-gray-500 text-sm">Personne ne vous suit pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {abonnes.map((abonne, index) => (
                <div
                  key={abonne.abonne_id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="relative">
                    {abonne.abonne?.avatar ? (
                      <img
                        src={abonne.abonne.avatar || "/placeholder.svg"}
                        alt={`Avatar de ${abonne.abonne.nom}`}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = "flex"
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-12 h-12 rounded-full bg-[#52c1ff] flex items-center justify-center text-white font-medium text-sm ${
                        abonne.abonne?.avatar ? "hidden" : "flex"
                      }`}
                    >
                      {abonne.abonne?.nom ? getInitials(abonne.abonne.nom) : "?"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {abonne.abonne?.nom || "Utilisateur inconnu"}
                    </h4>
                    <p className="text-sm text-gray-500">Vous suit</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
