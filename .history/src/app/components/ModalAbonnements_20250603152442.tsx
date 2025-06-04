"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { X } from "lucide-react"

export default function ModalAbonnements({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [abonnements, setAbonnements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAbonnements = async () => {
      const { data, error } = await supabase
        .from("abonnements")
        .select("abonnement_id, abonnement:utilisateurs!abonnement_id(nom, avatar)")
        .eq("abonne_id", userId)

      if (!error) setAbonnements(data)
      setLoading(false)
    }

    fetchAbonnements()
  }, [userId])

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold mb-4">Abonnements</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : abonnements.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun abonnement</p>
        ) : (
          <ul className="space-y-3">
            {abonnements.map((a) => (
              <li key={a.abonnement_id} className="flex items-center gap-3">
                <img
                  src={a.utilisateurs?.avatar || "/placeholder.svg"}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span>{a.utilisateurs?.nom}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
