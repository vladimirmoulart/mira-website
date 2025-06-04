"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/app/components/nav/DashboardLayout"
import { supabase } from "../../../../lib/supabaseClient"
import { FileText, Timer, X, CheckCircle, ArrowRight, ArrowLeft, Award, Loader2, AlertCircle } from "lucide-react"

export default function ProposerMission() {
  const [step, setStep] = useState(1)
  const [titre, setTitre] = useState("")
  const [description, setDescription] = useState("")
  const [duree, setDuree] = useState("")
  const [budget, setBudget] = useState("")
  const [competences, setCompetences] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const steps = [
    { id: 1, name: "Détails", icon: FileText, description: "Informations de base" },
    { id: 2, name: "Durée & Budget", icon: Timer, description: "Planification" },
    { id: 3, name: "Compétences", icon: Award, description: "Expertise requise" },
    { id: 4, name: "Confirmation", icon: CheckCircle, description: "Validation finale" },
  ]

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const newSkill = inputValue.trim()
      if (newSkill && !competences.includes(newSkill)) {
        setCompetences([...competences, newSkill])
        setInputValue("")
      }
    }
  }

  const removeSkill = (index: number) => {
    setCompetences(competences.filter((_, i) => i !== index))
  }

  const validateStep = (currentStep: number) => {
    setError("")
    switch (currentStep) {
      case 1:
        if (!titre.trim() || !description.trim()) {
          setError("Le titre et la description sont obligatoires.")
          return false
        }
        if (titre.length < 5) {
          setError("Le titre doit contenir au moins 5 caractères.")
          return false
        }
        if (description.length < 20) {
          setError("La description doit contenir au moins 20 caractères.")
          return false
        }
        break
      case 2:
        if (!duree.trim() || !budget.trim()) {
          setError("La durée et le budget sont obligatoires.")
          return false
        }
        if (Number(budget) <= 0) {
          setError("Le budget doit être supérieur à 0.")
          return false
        }
        break
      case 3:
        if (competences.length === 0) {
          setError("Au moins une compétence est requise.")
          return false
        }
        break
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setError("")
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setLoading(true)
    setError("")

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError("Utilisateur non connecté. Veuillez vous reconnecter.")
        setLoading(false)
        return
      }

      const { data: utilisateur, error: utilisateurError } = await supabase
        .from("utilisateurs")
        .select("id")
        .eq("email", user.email)
        .single()

      if (utilisateurError || !utilisateur) {
        setError("Impossible de retrouver l'utilisateur dans la base.")
        setLoading(false)
        return
      }

      const { error } = await supabase.from("missions").insert({
        titre: titre.trim(),
        description: description.trim(),
        duree: duree.trim(),
        budget: Number(budget),
        competences,
        id_entreprise: utilisateur.id,
        date_creation: new Date().toISOString(),
        statut: "candidature",
      })

      if (error) {
        console.error(error)
        setError("Erreur lors de la création de la mission. Veuillez réessayer.")
      } else {
        // Success - redirect after a short delay to show success state
        setTimeout(() => {
          router.push("/dashboard/mes-projets")
        }, 1500)
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError("Une erreur inattendue s'est produite.")
    } finally {
      setLoading(false)
    }
  }

  const getStepStatus = (stepId: number) => {
    if (step > stepId) return "completed"
    if (step === stepId) return "current"
    return "upcoming"
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="space-y-1">
              <h1 className="text-3xl font-medium text-gray-900">Proposer une mission</h1>
              <p className="text-gray-500">Créez une nouvelle mission pour votre projet</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex justify-between items-center relative max-w-3xl mx-auto">
              {/* Progress line */}
              <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200 -z-10">
                <div
                  className="h-full bg-[#52c1ff] transition-all duration-500"
                  style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((stepItem) => {
                const status = getStepStatus(stepItem.id)
                const StepIcon = stepItem.icon

                return (
                  <div key={stepItem.id} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        status === "completed"
                          ? "bg-green-500 text-white"
                          : status === "current"
                            ? "bg-[#52c1ff] text-white"
                            : "bg-white text-gray-400 border-2 border-gray-200"
                      }`}
                    >
                      {status === "completed" ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <div className="mt-3 text-center">
                      <p
                        className={`text-sm font-medium ${
                          status === "current"
                            ? "text-[#52c1ff]"
                            : status === "completed"
                              ? "text-green-500"
                              : "text-gray-500"
                        }`}
                      >
                        {stepItem.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{stepItem.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center gap-3 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Mission Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-[#52c1ff] rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Détails de la mission</h2>
                  <p className="text-gray-500 text-sm">Décrivez votre projet en détail</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre de la mission *</label>
                    <input
                      type="text"
                      placeholder="Ex: Développement d'une application mobile"
                      value={titre}
                      onChange={(e) => setTitre(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all"
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">{titre.length}/100 caractères</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description détaillée *</label>
                    <textarea
                      placeholder="Décrivez votre projet, les objectifs, le contexte, et les livrables attendus..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all resize-none"
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 mt-1">{description.length}/1000 caractères</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-2 bg-[#52c1ff] text-white font-medium rounded-lg hover:bg-[#52c1ff]/90 transition-all duration-300"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Duration & Budget */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-[#52c1ff] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Timer className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Durée & Budget</h2>
                  <p className="text-gray-500 text-sm">Définissez le planning et la rémunération</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Durée estimée *</label>
                    <input
                      type="text"
                      placeholder="Ex: 2 mois, 6 semaines..."
                      value={duree}
                      onChange={(e) => setDuree(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget estimé (€) *</label>
                    <input
                      type="number"
                      placeholder="5000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Conseils pour votre mission</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Soyez réaliste sur la durée nécessaire</li>
                    <li>• Le budget doit refléter la complexité du projet</li>
                    <li>• Prévoyez une marge pour les imprévus</li>
                  </ul>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#52c1ff] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-2 bg-[#52c1ff] text-white font-medium rounded-lg hover:bg-[#52c1ff]/90 transition-all duration-300"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Skills */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-[#52c1ff] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Compétences requises</h2>
                  <p className="text-gray-500 text-sm">Ajoutez les compétences nécessaires pour votre projet</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter une compétence *</label>
                  <input
                    type="text"
                    placeholder="Ex: React, Figma, Python... (Entrée pour ajouter)"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Appuyez sur Entrée pour ajouter la compétence</p>
                </div>

                {competences.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Compétences ajoutées ({competences.length})
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {competences.map((skill, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-2 bg-[#52c1ff] text-white px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(index)}
                            type="button"
                            className="hover:text-red-200 transition-colors"
                            title="Supprimer cette compétence"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Exemples de compétences</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <span>• React / Vue.js</span>
                    <span>• Figma / Adobe XD</span>
                    <span>• Python / JavaScript</span>
                    <span>• Marketing Digital</span>
                    <span>• SEO / SEM</span>
                    <span>• UI/UX Design</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#52c1ff] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-2 bg-[#52c1ff] text-white font-medium rounded-lg hover:bg-[#52c1ff]/90 transition-all duration-300"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Confirmation</h2>
                  <p className="text-gray-500 text-sm">Vérifiez les informations avant de publier votre mission</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informations générales</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Titre:</span>
                          <p className="font-medium text-gray-900">{titre}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Description:</span>
                          <p className="font-medium text-gray-900 line-clamp-3">{description}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Planning & Budget</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Durée:</span>
                          <p className="font-medium text-gray-900">{duree}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Budget:</span>
                          <p className="font-medium text-gray-900">{budget} €</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Compétences requises ({competences.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {competences.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-[#52c1ff] text-white px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Prêt à publier</h4>
                  <p className="text-sm text-green-700">
                    Votre mission sera visible par tous les freelancers correspondant aux compétences requises.
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={loading}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#52c1ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-[#52c1ff] text-white font-medium rounded-lg hover:bg-[#52c1ff]/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Créer la mission
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
