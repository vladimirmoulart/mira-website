"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "../../../lib/supabaseClient"
import bcrypt from "bcryptjs"
import {
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Briefcase,
  User,
  Loader2,
  UserPlus,
  Mail,
  ArrowRight,
} from "lucide-react"

export default function Inscription() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState("1")
  const [nom, setNom] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleRegister = async () => {
  // Vérification si les mots de passe correspondent
    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.")
      return
    }
  // Vérification de la longueur du mot de passe
    if (password.length < 12) {
      setErrorMessage("Le mot de passe doit contenir au moins 12 caractères.")
      return
    }

    setErrorMessage("")
    setIsLoading(true)

    try {
    //hashage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
    // Création du compte dans Supabase
      const { data, error } = await supabase.auth.signUp({ email, password: hashedPassword });

      if (error) {
        setErrorMessage(error.message)
        return
      }

      const user = data.user
      if (!user) {
        setErrorMessage("Erreur lors de la création du compte.")
        return
      }
    // Insertion des informations dans la base de données utilisateur
      const { error: dbError } = await supabase.from("utilisateurs").insert([
        {
          id: user.id,
          nom,
          email,
          mot_de_passe: hashedPassword,
          role: Number.parseInt(role),
        },
      ])

      if (dbError) {
        setErrorMessage("Erreur lors de l'enregistrement : " + dbError.message)
        return
      }

      //message de succès et redirection vers la connexion
      setSuccessMessage("Inscription réussie ! Redirection...")
      setTimeout(() => {
        window.location.href = "/connexion"
      }, 2000)


    } catch (error) {
      setErrorMessage("Une erreur inattendue s'est produite. Veuillez réessayer.")
      console.error("Registration error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  //les différentes étapes de l'inscription 
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Choisissez votre profil"
      case 2:
        return "Vos informations"
      case 3:
        return "Confirmation"
      default:
        return "Inscription"
    }
  }

  const getStepStatus = (stepNumber: number) => {
    if (step > stepNumber) return "completed"
    if (step === stepNumber) return "current"
    return "upcoming"
  }

  return (
    <div className="min-h-screen mt--10 bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo and header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Image src="/images/logo-mira.png" alt="Logo MIRA" width={150} height={150} priority />
          </div>
          <h1 className="text-3xl font-medium text-gray-900">Créer un compte</h1>
          <p className="text-gray-500 mt-2">Rejoignez notre communauté en quelques étapes simples</p>
        </div>

        {/* Progress steps */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="flex justify-between items-center relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10">
              <div
                className="h-full bg-[#52c1ff] transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>

            {["Profil", "Informations", "Confirmation"].map((label, index) => {
              const stepNum = index + 1
              const status = getStepStatus(stepNum)

              return (
                <div key={index} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      status === "completed"
                        ? "bg-green-500 text-white"
                        : status === "current"
                          ? "bg-[#52c1ff] text-white"
                          : "bg-white text-gray-400 border-2 border-gray-200"
                    }`}
                  >
                    {status === "completed" ? <CheckCircle className="w-5 h-5" /> : stepNum}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      status === "current"
                        ? "text-[#52c1ff]"
                        : status === "completed"
                          ? "text-green-500"
                          : "text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#52c1ff] rounded-lg flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            {getStepTitle()}
          </h2>

          {/* Status messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg flex items-center gap-3 border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-800 text-sm">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center gap-3 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800 text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Step 1: Role selection */}
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-gray-600">Quel type de compte souhaitez-vous créer ?</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Entreprise */}
                <button
                  type="button"
                  onClick={() => {
                    setRole("2")
                  }}
                  className={`relative group flex flex-col items-center p-6 rounded-lg border-2 transition-all duration-300 ${
                    role === "2"
                      ? "border-[#52c1ff] bg-blue-50"
                      : "border-gray-200 hover:border-[#52c1ff]/50 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-[#52c1ff] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Entreprise</h3>
                  <p className="text-sm text-gray-600 text-center">Je cherche des freelances pour mes projets</p>

                  <div className="absolute top-3 right-3">
                    {role === "2" && <CheckCircle className="w-5 h-5 text-[#52c1ff]" />}
                  </div>
                </button>

                {/* Freelance */}
                <button
                  type="button"
                  onClick={() => {
                    setRole("1")
                  }}
                  className={`relative group flex flex-col items-center p-6 rounded-lg border-2 transition-all duration-300 ${
                    role === "1"
                      ? "border-[#ffbb88] bg-orange-50"
                      : "border-gray-200 hover:border-[#ffbb88]/50 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-[#ffbb88] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Freelance</h3>
                  <p className="text-sm text-gray-600 text-center">Je propose mes services en tant que freelance</p>

                  <div className="absolute top-3 right-3">
                    {role === "1" && <CheckCircle className="w-5 h-5 text-[#ffbb88]" />}
                  </div>
                </button>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 py-2 px-6 bg-[#52c1ff] hover:bg-[#52c1ff]/90 text-white font-medium rounded-lg transition-colors"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Personal information */}
          {step === 2 && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setStep(3)
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom complet
                </label>
                <input
                  id="nom"
                  type="text"
                  placeholder="Votre nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Le mot de passe doit contenir au moins 6 caractères</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-gray-600 hover:text-[#52c1ff] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Retour
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 py-2 px-6 bg-[#52c1ff] hover:bg-[#52c1ff]/90 text-white font-medium rounded-lg transition-colors"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Récapitulatif de votre inscription</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                    <div className="w-8 h-8 bg-[#52c1ff] rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nom</p>
                      <p className="font-medium text-gray-900">{nom}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                    <div className="w-8 h-8 bg-[#52c1ff] rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        role === "1" ? "bg-[#ffbb88]" : "bg-[#52c1ff]"
                      }`}
                    >
                      {role === "1" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Briefcase className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type de compte</p>
                      <p className={`font-medium ${role === "1" ? "text-[#ffbb88]" : "text-[#52c1ff]"}`}>
                        {role === "1" ? "Freelance" : "Entreprise"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#52c1ff] hover:bg-[#52c1ff]/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Créer mon compte
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 text-gray-600 hover:text-[#52c1ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Modifier mes informations
                </button>
              </div>
            </div>
          )}

          {/* Login link */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-4">Vous avez déjà un compte ?</p>
            <Link
              href="/connexion"
              className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-white border border-[#52c1ff] text-[#52c1ff] font-medium rounded-lg hover:bg-[#52c1ff] hover:text-white transition-all duration-300"
            >
              Se connecter
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MIRA. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  )
}
