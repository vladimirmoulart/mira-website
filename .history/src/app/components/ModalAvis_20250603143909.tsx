"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { X, Star } from "lucide-react"

interface Avis {
  id: string
  avis: number
  comment: string
  created_at: string
  avis_pour_user?: { nom: string }
}

export default function ModalAvis({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [avis, setAvis] = useState<Avis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAvis = async () => {
      const { data, error } = await supabase
        .from("avis")
        .select("id, avis, comment, created_at, avis_pour_user:avis_pour(nom)")
        .eq("freelancer_id", userId)
        .order("created_at", { ascending: false })

      if (!error) setAvis(data as Avis[])
      setLoading(false)
    }

    fetchAvis()
  }, [userId])

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold mb-4">Avis reçus</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : avis.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun avis reçu</p>
        ) : (
          <ul className="space-y-4">
            {avis.map((a) => (
              <li key={a.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1 text-yellow-500">
                  {Array.from({ length: a.avis }).map((_, i) => (
                    <Star key={i} className="w-4 h-4" />
                  ))}
                </div>
                <p className="text-sm text-gray-700">{a.comment || "Pas de commentaire"}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Par {a.avis_pour_user?.nom ?? "—"} le{" "}
                  {new Date(a.created_at).toLocaleDateString("fr-FR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
