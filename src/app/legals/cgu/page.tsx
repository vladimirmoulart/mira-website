"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

export default function CGU() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions Générales d'Utilisation – MIRA</h1>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Objet</h2>
              <p className="text-gray-700 leading-relaxed">
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site MIRA
                (ci-après « le Site »), ainsi que les services proposés par MIRA aux utilisateurs (étudiants,
                entreprises, administrateurs).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Inscription et accès au site</h2>
              <p className="text-gray-700 leading-relaxed">
                L'accès à certaines fonctionnalités du Site nécessite une inscription préalable. Lors de l'inscription,
                vous vous engagez à fournir des informations véridiques et à jour. Vous êtes responsable de la
                confidentialité de vos informations de connexion et de toute activité effectuée sous votre compte.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Utilisation des services</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Pour les étudiants :</strong> vous pouvez créer un profil, postuler à des missions et échanger
                  avec les entreprises.
                </li>
                <li>
                  <strong>Pour les entreprises :</strong> vous pouvez publier des missions, consulter des candidatures
                  et sélectionner des étudiants.
                </li>
                <li>
                  <strong>Pour les administrateurs :</strong> vous êtes responsable de la gestion des utilisateurs, des
                  missions et des paiements.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Responsabilités des utilisateurs</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Vous vous engagez à utiliser le Site de manière conforme aux lois et règlements en vigueur.</li>
                <li>Vous vous interdisez de publier du contenu illégal ou non conforme à l'éthique.</li>
                <li>MIRA se réserve le droit de suspendre ou de supprimer un compte en cas de violation des CGU.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Propriété intellectuelle</h2>
              <p className="text-gray-700 leading-relaxed">
                Le contenu du Site, incluant mais ne se limitant pas aux textes, images, logos et logiciels, est protégé
                par le droit d'auteur et la propriété intellectuelle. Toute reproduction, redistribution ou modification
                sans l'accord préalable de MIRA est interdite.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Paiement et facturation (si applicable)</h2>
              <p className="text-gray-700 leading-relaxed">
                MIRA assure un paiement sécurisé des prestations réalisées entre étudiants et entreprises via des
                services tiers de paiement (comme Stripe). Des frais de service peuvent s'appliquer.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Modification des CGU</h2>
              <p className="text-gray-700 leading-relaxed">
                MIRA se réserve le droit de modifier ces Conditions Générales d'Utilisation à tout moment. Les
                utilisateurs seront informés de ces modifications via le site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Droit applicable et juridiction compétente
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Les présentes CGU sont régies par le droit français. Tout litige sera soumis à la compétence exclusive
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
