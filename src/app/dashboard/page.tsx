"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { DashboardContent } from "@/components/dashboard-content"

/**
 * DashboardPage is the main page shown after login.
 * It checks for a valid Supabase session and redirects to login if needed.
 */
export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true) // Controls loading spinner while checking session

  // On mount, check whether the user is logged in
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        // Redirect to login if session is not found
        router.push("/login")
      } else {
        // Stop loading once session is confirmed
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  // Show spinner while checking session
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Render dashboard content after session is verified
  return <DashboardContent />
}
