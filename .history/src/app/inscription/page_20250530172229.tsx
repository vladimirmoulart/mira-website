"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "../../../lib/supabaseClient"
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
    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.")
      return
    }

    if (password.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }

    setErrorMessage("")
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      const user = data.user
      if (!user) {
        setErrorMessage("Erreur lors de la création du compte.")
        return
      }

      const { error: dbError } = await supabase.from("utilisateurs").insert([
        {
          id: user.id,
          nom,
          email,
          mot_de_passe: password, // Note: storing passwords in plaintext is not recommended
          role: Number.parseInt(role),
        },
      ])

      if (dbError) {
        setErrorMessage("Erreur lors de l'enregistrement : " + dbError.message)
        return
      }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-[#52c1ff]/20 to-[#ffbb88]/20 rounded-b-[100px] -z-10" />
      <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-l from-[#52c1ff]/20 to-[#ffbb88]/20 rounded-t-[100px] -z-10" />

      <div className="w-full max-w-2xl">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#52c1ff]/30 to-[#ffbb88]/30 rounded-full blur-xl opacity-70 animate-pulse" />
            <Image src="/images/logo-mira.png" alt="Logo MIRA" width={120} height={120} className="relative" priority />
          </div>
          <h1 className="text-3xl font-bold bg-gray-400 bg-clip-text text-transparent">
            Créer un compte
          </h1>
          <p className="text-gray-600 mt-2">Rejoignez notre communauté en quelques étapes simples</p>
        </div>

        {/* Progress steps */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="flex justify-between items-center relative">
            {["Profil", "Informations", "Confirmation"].map((label, index) => {
              const stepNum = index + 1
              const isActive = step === stepNum
              const isCompleted = step > stepNum

              return (
                <div key={index} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#ffbb88] text-white shadow-lg"
                        : isActive
                          ? "bg-[#52c1ff] text-white shadow-md"
                          : "bg-white text-gray-400 border border-gray-200"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNum}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isActive ? "text-[#52c1ff]" : isCompleted ? "text-[#ffbb88]" : "text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              )
            })}

            {/* Progress bar */}
            <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200 -z-0">
              <div
                className="h-full bg-gray-400 transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transition-all">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#52c1ff]" />
            {getStepTitle()}
          </h2>

          {/* Status messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl flex items-center gap-3 border border-green-100 animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-800 text-sm">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl flex items-center gap-3 border border-red-100 animate-fadeIn">
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
                    setStep(2)
                  }}
                  className={`relative group flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                    role === "2"
                      ? "border-[#ffbb88] bg-gradient-to-r from-[#ffbb88]/10 to-[#ffbb88]/5 shadow-lg"
                      : "border-gray-200 hover:border-[#ffbb88]/50 hover:bg-[#ffbb88]/5"
                  }`}
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#ffbb88]/20 to-[#ffbb88]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-10 h-10 text-[#ffbb88]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Entreprise</h3>
                  <p className="text-sm text-gray-600 text-center">Je cherche des freelances pour mes projets</p>

                  <div className="absolute top-3 right-3">
                    {role === "2" && <CheckCircle className="w-5 h-5 text-[#ffbb88]" />}
                  </div>
                </button>

                {/* Freelance */}
                <button
                  type="button"
                  onClick={() => {
                    setRole("1")
                    setStep(2)
                  }}
                  className={`relative group flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                    role === "1"
                      ? "border-[#52c1ff] bg-gradient-to-r from-[#52c1ff]/10 to-[#52c1ff]/5 shadow-lg"
                      : "border-gray-200 hover:border-[#52c1ff]/50 hover:bg-[#52c1ff]/5"
                  }`}
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#52c1ff]/20 to-[#52c1ff]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <User className="w-10 h-10 text-[#52c1ff]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Freelance</h3>
                  <p className="text-sm text-gray-600 text-center">Je propose mes services en tant que freelance</p>

                  <div className="absolute top-3 right-3">
                    {role === "1" && <CheckCircle className="w-5 h-5 text-[#52c1ff]" />}
                  </div>
                </button>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 py-2 px-6 bg-[#ffbb88] hover:from-[#52c1ff]/90 hover:to-[#ffbb88]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
                  className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all pr-10"
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
                    className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all pr-10"
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
                  className="flex items-center gap-2 py-2 px-6 bg-[#ffbb88] hover:from-[#52c1ff]/90 hover:to-[#ffbb88]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif de votre inscription</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="p-2 bg-gradient-to-r from-[#52c1ff]/20 to-[#52c1ff]/10 rounded-lg">
                      <User className="w-5 h-5 text-[#52c1ff]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nom</p>
                      <p className="font-medium text-gray-900">{nom}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="p-2 bg-gradient-to-r from-[#52c1ff]/20 to-[#52c1ff]/10 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-[#52c1ff]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        role === "1"
                          ? "bg-gradient-to-r from-[#52c1ff]/20 to-[#52c1ff]/10"
                          : "bg-gradient-to-r from-[#ffbb88]/20 to-[#ffbb88]/10"
                      }`}
                    >
                      {role === "1" ? (
                        <User className={`w-5 h-5 ${role === "1" ? "text-[#52c1ff]" : "text-[#ffbb88]"}`} />
                      ) : (
                        <Briefcase className={`w-5 h-5 ${role === "1" ? "text-[#52c1ff]" : "text-[#ffbb88]"}`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type de compte</p>
                      <p className={`font-medium ${role === "1" ? "text-[#52c1ff]" : "text-[#ffbb88]"}`}>
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
                  className="w-full py-3 px-4 bg-[#52c1ff] hover:from-[#52c1ff]/90 hover:to-[#ffbb88]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
            <p className="text-gray-600">
              Vous avez déjà un compte ?{" "}
              <Link href="/connexion" className="font-medium text-[#52c1ff] hover:text-[#ffbb88] transition-colors">
                Connectez-vous
              </Link>
            </p>
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
