"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { X, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Abonnement {
  abonnement_id: string
  abonnement: {
    nom: string
    avatar: string | null
  } | null
}

interface ModalAbonnementsProps {
  userId: string
  onClose: () => void
  isOpen: boolean
}

export default function ModalAbonnements({ userId, onClose, isOpen }: ModalAbonnementsProps) {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const fetchAbonnements = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from("abonnements")
          .select("abonnement_id, abonnement:utilisateurs!abonnement_id(nom, avatar)")
          .eq("abonne_id", userId)

        if (error) throw error

        setAbonnements(data || [])
      } catch (err) {
        setError("Erreur lors du chargement des abonnements")
        console.error("Error fetching abonnements:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAbonnements()
  }, [userId, isOpen])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Abonnements
            {!loading && <span className="text-sm font-normal text-muted-foreground">({abonnements.length})</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState error={error} onRetry={() => window.location.reload()} />
          ) : abonnements.length === 0 ? (
            <EmptyState />
          ) : (
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-3">
                {abonnements.map((abonnement) => (
                  <div
                    key={abonnement.abonnement_id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={abonnement.abonnement?.avatar || undefined}
                        alt={abonnement.abonnement?.nom || "Avatar"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                        {abonnement.abonnement?.nom ? getInitials(abonnement.abonnement.nom) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {abonnement.abonnement?.nom || "Utilisateur inconnu"}
                      </p>
                      <p className="text-sm text-muted-foreground">Abonné</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="font-medium text-foreground mb-2">Aucun abonnement</h3>
      <p className="text-sm text-muted-foreground">Vous ne suivez personne pour le moment.</p>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <X className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="font-medium text-foreground mb-2">Erreur de chargement</h3>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      <Button onClick={onRetry} variant="outline" size="sm">
        <Loader2 className="h-4 w-4 mr-2" />
        Réessayer
      </Button>
    </div>
  )
}
