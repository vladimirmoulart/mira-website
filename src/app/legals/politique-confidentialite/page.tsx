"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

export default function PolitiqueConfidentialite() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de confidentialité – MIRA</h1>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                MIRA s'engage à respecter la vie privée et la protection des données personnelles de ses utilisateurs.
                Cette politique de confidentialité décrit les informations collectées sur notre plateforme et explique
                comment elles sont utilisées, stockées et protégées, conformément au Règlement Général sur la Protection
                des Données (RGPD).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Données collectées</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Lors de votre inscription ou de votre utilisation de la plateforme MIRA, nous collectons les données
                suivantes :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Informations personnelles :</strong> nom, prénom, email, rôle (étudiant, entreprise,
                  administrateur), mot de passe.
                </li>
                <li>
                  <strong>Informations professionnelles :</strong> compétences, expériences, portfolio (pour les
                  étudiants), missions publiées (pour les entreprises).
                </li>
                <li>
                  <strong>Données de navigation :</strong> adresse IP, type de navigateur, données de géolocalisation
                  (si nécessaire pour certaines fonctions).
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Finalités du traitement</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Les données collectées sont utilisées pour les finalités suivantes :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Gérer les inscriptions et connexions des utilisateurs</li>
                <li>Assurer la mise en relation entre étudiants et entreprises</li>
                <li>Gérer les candidatures, missions, et notifications</li>
                <li>Assurer la sécurité du site et des transactions</li>
                <li>Améliorer les fonctionnalités de la plateforme</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Durée de conservation des données</h2>
              <p className="text-gray-700 leading-relaxed">
                Les données personnelles sont conservées pendant la durée nécessaire à l'exécution des services fournis,
                et au maximum pour une période de 3 ans après la dernière activité sur la plateforme, sauf si une
                période de conservation plus longue est exigée par la loi.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Droits des utilisateurs</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification des informations inexactes</li>
                <li>Droit à l'effacement (droit à l'oubli)</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit à la limitation du traitement ou à l'opposition au traitement</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Pour exercer ces droits, contactez-nous à l'adresse suivante :
                <a href="mailto:contact@mira.com" className="text-[#52c1ff] hover:text-[#ffbb88] font-medium">
                  contact@mira.com
                </a>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Sécurité des données</h2>
              <p className="text-gray-700 leading-relaxed">
                MIRA met en place des mesures techniques et organisationnelles appropriées pour garantir la sécurité et
                la confidentialité de vos données personnelles. Nous utilisons des techniques de cryptage et de
                sécurisation des accès (authentification renforcée, mots de passe hachés, etc.).
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
