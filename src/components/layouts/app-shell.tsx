"use client"

import { ReactNode } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { SidebarListFetcher } from "@/components/sidebar-list-fetcher"

/**
 * AppShell is the main layout wrapper for authenticated pages.
 * It renders a collapsible sidebar, a global header, and the main content area.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar (collapsible) */}
        <Sidebar  className="border-r bg-red">
          <SidebarContent>
            <SidebarGroup>
   
              <SidebarGroupContent>
                <SidebarListFetcher />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top navbar */}
          <SiteHeader />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
