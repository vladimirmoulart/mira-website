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
        setAbonnes(data || [])
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
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Abonnés</h2>
              {!loading && (
                <p className="text-sm text-gray-500">
                  {abonnes.length} abonné{abonnes.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all duration-200 flex items-center justify-center group"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : abonnes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun abonné</h3>
              <p className="text-gray-500">Personne ne vous suit pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {abonnes.map((abonne, index) => (
                <div
                  key={abonne.abonne_id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-200 group cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative">
                    {abonne.abonne?.avatar ? (
                      <img
                        src={abonne.abonne.avatar || "/placeholder.svg"}
                        alt={`Avatar de ${abonne.abonne.nom}`}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:ring-purple-200 transition-all"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = "flex"
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold shadow-sm group-hover:scale-105 transition-transform ${
                        abonne.abonne?.avatar ? "hidden" : "flex"
                      }`}
                    >
                      {abonne.abonne?.nom ? getInitials(abonne.abonne.nom) : "?"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                      {abonne.abonne?.nom || "Utilisateur inconnu"}
                    </h4>
                    <p className="text-sm text-gray-500">Vous suit</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
