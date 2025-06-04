"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { X, User } from "lucide-react"

export default function ModalAbonnes({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [abonnes, setAbonnes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAbonnes = async () => {
      const { data, error } = await supabase
        .from("abonnements")
        .select("abonne_id, utilisateurs(nom, avatar)")
        .eq("abonnement_id", userId)

      if (!error) setAbonnes(data)
      setLoading(false)
    }

    fetchAbonnes()
  }, [userId])

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold mb-4">Abonnés</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : abonnes.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun abonné</p>
        ) : (
          <ul className="space-y-3">
            {abonnes.map((a) => (
              <li key={a.abonne_id} className="flex items-center gap-3">
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
