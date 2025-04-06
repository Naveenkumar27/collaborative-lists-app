import { ReactNode } from "react"
import { AppShell } from "@/components/layouts/app-shell"

export default function ListLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
