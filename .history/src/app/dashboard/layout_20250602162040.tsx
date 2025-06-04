export const dynamic = "force-dynamic"

import { headers } from "next/headers"
import type { ReactNode } from "react"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = headers().get("x-url") || ""

  return (
    <>
      <Navbar pathname={pathname} />
      <main className="ml-72">{children}</main>
    </>
  )
}
