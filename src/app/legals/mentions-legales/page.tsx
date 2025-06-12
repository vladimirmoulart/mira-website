"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

export default function MentionsLegales() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#52c1ff] hover:text-[#ffbb88] transition-colors font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions légales – MIRA</h1>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Informations générales</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>Le site MIRA est édité par :</p>
                <div className="ml-4">
                  <p>
                    <strong>MIRA</strong>
                  </p>
                  <p>SIRET : [numéro]</p>
                  <p>Adresse : [adresse complète]</p>
                  <p>
                    Email :{" "}
                    <a href="mailto:contact@mira.com" className="text-[#52c1ff] hover:text-[#ffbb88] font-medium">
                      contact@mira.com
                    </a>
                  </p>
                  <p>Directeur de la publication : [Nom, Prénom]</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Hébergement</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>Le site est hébergé par :</p>
                <div className="ml-4">
                  <p>Nom de l'hébergeur</p>
                  <p>Adresse : [adresse de l'hébergeur]</p>
                  <p>Téléphone : [numéro de l'hébergeur]</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Propriété intellectuelle</h2>
              <p className="text-gray-700 leading-relaxed">
                Tous les contenus présents sur le site MIRA, incluant mais ne se limitant pas aux textes, images,
                graphiques, logos, vidéos, et autres supports multimédia, sont protégés par le droit d'auteur et sont la
                propriété exclusive de MIRA, sauf indication contraire. Toute reproduction ou distribution sans
                autorisation est interdite.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Responsabilité</h2>
              <p className="text-gray-700 leading-relaxed">
                MIRA ne peut être tenue responsable des dommages directs ou indirects résultant de l'utilisation de la
                plateforme, notamment en cas de dysfonctionnements techniques, pertes de données, ou mauvaise
                utilisation du service par l'utilisateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Le site MIRA utilise des cookies pour améliorer l'expérience de navigation, notamment pour suivre les
                préférences de l'utilisateur et analyser la fréquentation du site. En naviguant sur le site, vous
                acceptez l'utilisation de cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Loi applicable</h2>
              <p className="text-gray-700 leading-relaxed">
                Les présentes mentions légales sont régies par la loi française. Tout litige sera soumis à la compétence
                des tribunaux français.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
