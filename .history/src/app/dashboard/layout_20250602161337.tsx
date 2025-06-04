export const dynamic = "force-dynamic"  
import Navbar from "@/app/components/Navbar"
import { headers } from "next/headers"
import type { ReactNode } from "react"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = (await headers()).get("x-invoke-path") || ""
  return (
    <>
      <Navbar pathname={pathname} />
      <main className="ml-72">{children}</main>
    </>
  )
}
