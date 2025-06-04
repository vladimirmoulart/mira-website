"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "../../../lib/supabaseClient"
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function Connexion() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      setSuccessMessage("Connexion réussie ! Redirection...")

      setTimeout(() => {
        window.location.href = "/dashboard/feed"
      }, 1500)
    } catch (error) {
      setErrorMessage("Une erreur inattendue s'est produite. Veuillez réessayer.")
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-[#52c1ff]/20 to-[#ffbb88]/20 rounded-b-[100px] -z-10" />
      <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-l from-[#52c1ff]/20 to-[#ffbb88]/20 rounded-t-[100px] -z-10" />

      <div className="w-full max-w-md">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#52c1ff]/30 to-[#ffbb88]/30 rounded-full blur-xl opacity-70 animate-pulse" />
            <Image src="/images/logo-mira.png" alt="Logo MIRA" width={120} height={120} className="relative" priority />
          </div>
          <h1 className="text-3xl font-bold bg-gray-400 bg-clip-text text-transparent">
            Bienvenue
          </h1>
          <p className="text-gray-600 mt-2">Connectez-vous pour accéder à votre espace</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transition-all">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <LogIn className="w-5 h-5 text-[#52c1ff]" />
            Connexion
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-xs font-medium text-[#52c1ff] hover:text-[#ffbb88] transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all pr-10"
                  disabled={isLoading}
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#52c1ff] hover:from-[#52c1ff]/90 hover:to-[#ffbb88]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-gray-500">ou</span>
            </div>
          </div>

          {/* Registration link */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">Vous n'avez pas encore de compte ?</p>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-[#ffbb88]/20 text-[#ffbb88] font-medium rounded-xl border border-[#ffbb88]"
            >
              Créer un compte
              <span className="text-[#ffbb88]">→</span>
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
