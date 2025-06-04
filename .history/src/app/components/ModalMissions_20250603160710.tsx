"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { X, Briefcase, Calendar } from "lucide-react"

interface Mission {
  id: string
  titre: string
  description: string
  created_at: string
}

export default function ModalMissions({
  userId,
  onClose,
}: {
  userId: string
  onClose: () => void
}) {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMissions = async () => {
      const { data, error } = await supabase
  .from("postulations")
  .select(`
    id,
    id_utilisateur,
    mission:missions (
      id,
      titre,
      description,
      created_at,
      statut
    )
  `)
  .eq("id_utilisateur", userId)
  .eq("statut", "acceptée")
      if (!error && data) {
        const missionsTerminees = (data as any[])
          .map((item) => item.mission)
          .filter((mission) =>  mission?.statut === "terminée")

        setMissions(missionsTerminees)
      }

      setLoading(false)
    }

    fetchMissions()
  }, [userId])

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold mb-4">Missions réalisées</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : missions.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune mission terminée</p>
        ) : (
          <ul className="space-y-4">
            {missions.map((m) => (
              <li key={m.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  {m.titre}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{m.description || "Pas de description"}</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(m.created_at).toLocaleDateString("fr-FR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
