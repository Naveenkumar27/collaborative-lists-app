import { ReactNode } from "react"
import { AppShell } from "@/components/layouts/app-shell"

// Layout wrapper using AppShell component to provide global structure (sidebar/header)
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
