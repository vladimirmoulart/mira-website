"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { X, Star } from "lucide-react"

interface Avis {
  id: string
  avis: number
  comment: string | null
  created_at: string
  avis_par: {
    nom: string | null
  } | null
  avis_pour_user?: {
    nom: string | null
  }
}

interface ModalAvisProps {
  userId: string
  onClose: () => void
}

export default function ModalAvis({ userId, onClose }: ModalAvisProps) {
  const [avis, setAvis] = useState<Avis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
  const fetchAvis = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("avis")
        .select("id, avis, comment, created_at, avis_par:avis_par(nom)")
        .eq("freelancer_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      const avisFormates: Avis[] = (data || []).map((item: {
        id: string;
        avis: number;
        comment: string | null;
        created_at: string;
        avis_par: { nom: string | null }[];
      }) => ({
        id: item.id,
        avis: item.avis,
        comment: item.comment,
        created_at: item.created_at,
        avis_par: item.avis_par?.[0] || null,
      }))

      setAvis(avisFormates)
    } catch (err) 
      setError("Erreur lors du chargement des avis")
      console.error("Error fetching avis:", err)
    } finally {
      setLoading(false)
    }
  }

  fetchAvis()
}, [userId])


  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
      return new Date(dateString).toLocaleDateString("fr-FR", options)
    } catch (e) {
      return dateString
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getAverageRating = () => {
    if (!avis.length) return 0
    const sum = avis.reduce((acc, curr) => acc + curr.avis, 0)
    return (sum / avis.length).toFixed(1)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900">Avis reçus</h2>
              {!loading && avis.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span className="font-medium text-amber-500">{getAverageRating()}</span>
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>• {avis.length} avis</span>
                </div>
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
                <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="w-4 h-4 rounded-full bg-gray-200 animate-pulse" />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-full" />
                    <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-3/4" />
                  </div>
                  <div className="h-2 bg-gray-200 rounded-lg animate-pulse w-1/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#52c1ff] text-white rounded-lg hover:bg-[#52c1ff]/90 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : avis.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis reçu</h3>
              <p className="text-gray-500">Vous n'avez pas encore reçu d'avis.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {avis.map((a) => (
                <div
                  key={a.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < a.avis ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                      />
                    ))}
                    <span className="ml-2 text-xs font-medium text-gray-500">{a.avis}/5</span>
                  </div>

                  <p className="text-sm text-gray-700">{a.comment || "Pas de commentaire"}</p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Par <span className="font-medium">{a.avis_par?.nom ?? "—"}</span>
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(a.created_at)}</p>
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
