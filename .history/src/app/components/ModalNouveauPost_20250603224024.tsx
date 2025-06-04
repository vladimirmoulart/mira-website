"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { X, Send, Loader2, AlertCircle, CheckCircle, FileText, Plus } from "lucide-react"

export default function ModalNouveauPost({ onClose }: { onClose: () => void }) {
  const [titre, setTitre] = useState("")
  const [contenu, setContenu] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async () => {
    setErrorMessage("")
    setSuccessMessage("")

    if (!titre.trim() || !contenu.trim()) {
      setErrorMessage("Le titre et le contenu sont obligatoires.")
      return
    }

    if (titre.length > 100) {
      setErrorMessage("Le titre ne peut pas dépasser 100 caractères.")
      return
    }

    if (contenu.length > 1000) {
      setErrorMessage("Le contenu ne peut pas dépasser 1000 caractères.")
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setErrorMessage("Vous devez être connecté pour publier.")
        setLoading(false)
        return
      }

      const { error } = await supabase.from("posts").insert({
        titre: titre.trim(),
        contenu: contenu.trim(),
        utilisateur_id: user.id,
      })

      if (error) {
        setErrorMessage("Erreur lors de la publication : " + error.message)
      } else {
        setSuccessMessage("Publication créée avec succès !")
        setTimeout(() => {
          onClose()
          setTitre("")
          setContenu("")
        }, 1500)
      }
    } catch (error) {
      setErrorMessage("Une erreur inattendue s'est produite.")
      console.error("Error creating post:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const remainingTitleChars = 100 - titre.length
  const remainingContentChars = 1000 - contenu.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg relative" onKeyDown={handleKeyDown}>
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#52c1ff] rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-gray-900">Nouveau post</h2>
                <p className="text-sm text-gray-500">Partagez vos idées avec la communauté</p>
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
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status messages */}
          {successMessage && (
            <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3 border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-800 text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-red-50 rounded-lg flex items-center gap-3 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Title input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="titre" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#52c1ff]" />
                  Titre de votre post
                </label>
                <span className={`text-xs font-medium ${remainingTitleChars < 20 ? "text-red-500" : "text-gray-500"}`}>
                  {remainingTitleChars} caractères restants
                </span>
              </div>
              <input
                id="titre"
                type="text"
                placeholder="Un titre accrocheur pour votre post..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                maxLength={100}
                disabled={loading}
              />
            </div>

            {/* Content textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="contenu" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#ffbb88]" />
                  Contenu
                </label>
                <span
                  className={`text-xs font-medium ${remainingContentChars < 100 ? "text-red-500" : "text-gray-500"}`}
                >
                  {remainingContentChars} caractères restants
                </span>
              </div>
              <textarea
                id="contenu"
                placeholder="Exprimez-vous ici... Partagez vos idées, expériences ou questions avec la communauté !"
                className="w-full h-40 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all resize-none"
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                maxLength={1000}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl</kbd> +{" "}
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Entrée</kbd> pour publier rapidement
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !titre.trim() || !contenu.trim()}
                className="px-6 py-2 bg-[#52c1ff] hover:bg-[#52c1ff]/90 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publication...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
