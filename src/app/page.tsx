"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Bars3Icon,
  XMarkIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
  ServerIcon,
  ArrowRightIcon,
  StarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline"

const navigation = [
  { name: "Fonctionnalités", href: "#features" },
  { name: "Témoignages", href: "#testimonials" },
  { name: "À propos", href: "#about" },
  { name: "Contact", href: "#contact" },
]

const posts = [
  {
    id: 1,
    title: "Une première mission enrichissante",
    href: "#",
    description:
      "Grâce à MIRA, j'ai pu décrocher une mission freelance pendant ma formation en UX Design. L'entreprise était sérieuse, l'encadrement au top. Je recommande à 100%.",
    date: "Jan 12, 2025",
    datetime: "2025-01-12",
    category: { title: "Étudiant", href: "#" },
    author: {
      name: "Léna Dupont",
      role: "Étudiante en UX Design - Digital School",
      href: "#",
      imageUrl: "https://randomuser.me/api/portraits/women/32.jpg",
    },
    rating: 5,
  },
  {
    id: 2,
    title: "Un vrai gain de temps et de flexibilité",
    href: "#",
    description:
      "Nous avons trouvé un étudiant en développement web via MIRA pour un projet urgent. Tout s'est passé de manière fluide, structurée, et avec un vrai suivi.",
    date: "Feb 3, 2025",
    datetime: "2025-02-03",
    category: { title: "Entreprise", href: "#" },
    author: {
      name: "Julien Mercier",
      role: "CTO - Agence StudioCraft",
      href: "#",
      imageUrl: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    rating: 5,
  },
  {
    id: 3,
    title: "Une opportunité professionnelle concrète",
    href: "#",
    description:
      "MIRA m'a permis de travailler sur une mission en marketing digital avec une startup lyonnaise. J'ai pu apprendre, pratiquer et me créer un vrai réseau.",
    date: "Feb 25, 2025",
    datetime: "2025-02-25",
    category: { title: "Étudiant", href: "#" },
    author: {
      name: "Thomas Caron",
      role: "Étudiant en Communication digitale - IAE Lyon",
      href: "#",
      imageUrl: "https://randomuser.me/api/portraits/men/34.jpg",
    },
    rating: 5,
  },
]

const stats = [
  { name: "Étudiants inscrits", value: "+ 1,399", icon: UserGroupIcon },
  { name: "Entreprises inscrites", value: "+ 150", icon: BuildingOfficeIcon },
  { name: "Établissements partenaires", value: "40", icon: AcademicCapIcon },
  { name: "Missions réussies", value: "+ 1,102", icon: CheckBadgeIcon },
]

const features = [
  {
    name: "Mise en relation immédiate",
    description: "Trouvez rapidement le bon étudiant pour votre mission grâce à notre plateforme fluide et intuitive.",
    icon: CloudArrowUpIcon,
  },
  {
    name: "Confiance & sécurité",
    description: "Nous validons chaque entreprise et chaque étudiant pour garantir un cadre fiable et professionnel.",
    icon: LockClosedIcon,
  },
  {
    name: "Suivi et traçabilité",
    description: "Chaque collaboration est documentée et suivie par notre équipe pour assurer la qualité.",
    icon: ServerIcon,
  },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-3">
              <img className="h-16 w-auto" src="/images/logo-mira.png" alt="MIRA" />
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-[#52c1ff] transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
            <Link
              href="/connexion"
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-[#52c1ff] transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/inscription"
              className="rounded-xl bg-[#ffbb88] px-4 py-1 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              S'inscrire
            </Link>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-50" />
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm border-l border-gray-200">
              <div className="flex items-center justify-between">
                <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                  <img className="h-8 w-auto" src="/images/logo-mira.png" alt="MIRA" />
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-200">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                  <div className="py-6 space-y-3">
                    <Link
                      href="/connexion"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/inscription"
                      className="block rounded-xl bg-[#52c1ff] px-3 py-2.5 text-base font-semibold text-white text-center"
                    >
                      S'inscrire
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-36">
          {/* Announcement banner */}
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-4 py-2 text-sm leading-6 text-gray-600 ring-1 ring-gray-300 hover:ring-gray-400 bg-white">
              Besoin d'un renseignement ?{" "}
              <a href="#contact" className="font-semibold text-[#52c1ff] hover:text-[#ffbb88] transition-colors">
                <span aria-hidden="true" className="absolute inset-0" />
                Contactez-nous <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-balance text-gray-900 sm:text-7xl">
              Boostez vos projets digitaux avec les <span className="text-[#52c1ff]">talents de demain</span>
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-gray-600 sm:text-xl/8 max-w-3xl mx-auto">
              MIRA connecte des étudiants en formation dans les métiers du digital avec des entreprises à la recherche
              de compétences spécifiques, dans un cadre professionnel et structuré.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/connexion"
                className="group rounded-xl bg-[#52c1ff] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2"
              >
                Se connecter
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/inscription"
                className="text-sm font-semibold text-gray-900 hover:text-[#52c1ff] transition-colors flex items-center gap-1"
              >
                S'inscrire <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div id="features" className="overflow-hidden bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:pt-4 lg:pr-8">
              <div className="lg:max-w-lg">
                <p className="mt-2 text-4xl font-bold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                  Une collaboration simple, rapide et efficace
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  MIRA simplifie la mise en relation entre étudiants qualifiés et entreprises sérieuses. Chaque mission
                  est accompagnée, encadrée et valorisée.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                  {features.map((feature) => (
                    <div key={feature.name} className="relative pl-9">
                      <dt className="inline font-semibold text-gray-900">
                        <feature.icon aria-hidden="true" className="absolute top-1 left-1 h-5 w-5 text-[#52c1ff]" />
                        {feature.name}
                      </dt>{" "}
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                alt="Collaboration entre entreprises et étudiants"
                src="/images/entreprise-etudiant.png"
                width={2432}
                height={1442}
                className="w-[38rem] max-w-none rounded-xl shadow-lg border border-gray-200 sm:w-[49rem] md:-ml-4 lg:-ml-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div id="about" className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
        <img
          alt=""
          src="/images/banniere-fond.png"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-right md:object-center opacity-30"
        />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Travaillons ensemble pour construire l'avenir du digital
            </h2>
            <p className="mt-8 text-lg font-medium text-pretty text-gray-300 sm:text-xl/8">
              Rejoignez notre réseau de talents et de partenaires pour co-construire des projets concrets, encadrés, et
              impactants dans les métiers du digital.
            </p>
          </div>

          {/* Stats grid */}
          <dl className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="flex flex-col-reverse gap-1 bg-white/10 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <dt className="text-base leading-7 text-gray-300 flex items-center gap-2">
                  <stat.icon className="w-5 h-5 text-[#52c1ff]" />
                  {stat.name}
                </dt>
                <dd className="text-4xl font-bold tracking-tight text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>

          {/* CTA buttons */}
          <div className="mt-16 flex flex-col sm:flex-row gap-4">
            <Link
              href="/inscription"
              className="rounded-xl bg-[#52c1ff] px-6 py-3 text-base font-semibold text-white shadow-sm hover:shadow-md transition-all duration-300 text-center"
            >
              Rejoindre la communauté
            </Link>
            <Link
              href="#contact"
              className="rounded-xl bg-white/10 px-6 py-3 text-base font-semibold text-white hover:bg-white/20 transition-all duration-300 text-center border border-white/20"
            >
              En savoir plus
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials section */}
      <div id="testimonials" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-bold tracking-tight text-pretty text-gray-900 sm:text-5xl">
              Ils nous ont fait confiance
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              Étudiants et entreprises partagent leur expérience avec notre plateforme.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex max-w-xl flex-col items-start justify-between bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
              >
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={post.datetime} className="text-gray-500">
                    {post.date}
                  </time>
                  <span
                    className={`relative z-10 rounded-full px-3 py-1.5 font-medium ${
                      post.category.title === "Étudiant"
                        ? "bg-[#52c1ff]/10 text-[#52c1ff]"
                        : "bg-[#ffbb88]/10 text-[#ffbb88]"
                    }`}
                  >
                    {post.category.title}
                  </span>
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                    <a href={post.href}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </a>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{post.description}</p>

                  {/* Rating */}
                  <div className="mt-4 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${i < post.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="relative mt-8 flex items-center gap-x-4">
                  <img
                    alt=""
                    src={post.author.imageUrl || "/placeholder.svg"}
                    className="h-10 w-10 rounded-full bg-gray-50"
                  />
                  <div className="text-sm leading-6">
                    <p className="font-semibold text-gray-900">
                      <a href={post.author.href}>
                        <span className="absolute inset-0" />
                        {post.author.name}
                      </a>
                    </p>
                    <p className="text-gray-600">{post.author.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <img className="h-10 w-auto" src="/images/logo-mira.png" alt="MIRA" />
              </div>
              <p className="text-sm leading-6 text-gray-300">
                La plateforme qui connecte les talents de demain avec les entreprises d'aujourd'hui.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-3 gap-8 xl:col-span-2 xl:mt-0">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Plateforme</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/inscription" className="text-sm leading-6 text-gray-300 hover:text-white">
                      S'inscrire
                    </Link>
                  </li>
                  <li>
                    <Link href="/connexion" className="text-sm leading-6 text-gray-300 hover:text-white">
                      Se connecter
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Support</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                      Centre d'aide
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Légal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link
                      href="/legals/politique-confidentialite"
                      className="text-sm leading-6 text-gray-300 hover:text-white"
                    >
                      Politique de confidentialité
                    </Link>
                  </li>
                  <li>
                    <Link href="/legals/mentions-legales" className="text-sm leading-6 text-gray-300 hover:text-white">
                      Mentions légales
                    </Link>
                  </li>
                  <li>
                    <Link href="/legals/cgu" className="text-sm leading-6 text-gray-300 hover:text-white">
                      CGU
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
            <p className="text-xs leading-5 text-gray-400">
              &copy; {new Date().getFullYear()} MIRA. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
