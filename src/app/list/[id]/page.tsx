"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ListDetail } from "@/components/list-detail"
import { Loader2 } from "lucide-react"

/**
 * ListPage is the dynamic route that loads a specific list by its ID.
 * It checks if the list exists and displays its details using <ListDetail />.
 * If the list is not found or invalid, it redirects to the dashboard.
 */
export default function ListPage() {
  const { id } = useParams() // Extract the list ID from the route
  const router = useRouter()
  const [list, setList] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // On mount or when 'id' changes, fetch the list from Supabase
  useEffect(() => {
    const fetchList = async () => {
      if (!id || typeof id !== "string") return

      const { data, error } = await supabase
        .from("lists")
        .select("id, name, is_shared")
        .eq("id", id)
        .single()

      if (error || !data) {
        // Redirect to dashboard if list not found
        router.push("/dashboard")
        return
      }

      // Set the list and stop loading
      setList(data)
      setLoading(false)
    }

    fetchList()
  }, [id, router])

  // Show loading spinner while data is being fetched
  if (loading || !list)
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )

  // Render list details once data is ready
  return <ListDetail list={list} />
}
