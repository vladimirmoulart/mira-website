import Navbar from "@/app/components/Navbar"
import type { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="ml-72">{children}</main>
    </>
  )
}
