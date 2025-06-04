"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "../../../lib/supabaseClient"
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle, Loader2, ArrowRight } from "lucide-react"

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
    <div className="min-h-screen bg-gray-50 mt--10 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image src="/images/logo-mira.png" alt="Logo MIRA" width={150} height={150} priority />
          </div>
          <h1 className="text-3xl font-medium text-gray-900">Bienvenue</h1>
          <p className="text-gray-500 mt-2">Connectez-vous pour accéder à votre espace</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#52c1ff] rounded-lg flex items-center justify-center">
              <LogIn className="w-4 h-4 text-white" />
            </div>
            Connexion
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all"
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
                  className="text-xs font-medium text-[#52c1ff] hover:text-[#52c1ff]/80 transition-colors"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent transition-all pr-10"
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
              className="w-full py-3 px-4 bg-[#52c1ff] hover:bg-[#52c1ff]/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Registration link */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">Vous n'avez pas encore de compte ?</p>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-white border border-[#ffbb88] text-[#ffbb88] font-medium rounded-lg hover:bg-[#ffbb88] hover:text-white transition-all duration-300"
            >
              Créer un compte
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
