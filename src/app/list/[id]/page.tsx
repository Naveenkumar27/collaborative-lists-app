"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ListDetail } from "@/components/list-detail"
import { Loader2 } from "lucide-react"

export default function ListPage() {
  const { id } = useParams()
  const router = useRouter()
  const [list, setList] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchList = async () => {
      if (!id || typeof id !== "string") return
      const { data, error } = await supabase
        .from("lists")
        .select("id, name, is_shared")
        .eq("id", id)
        .single()

      if (error || !data) {
        router.push("/dashboard") // fallback
        return
      }

      setList(data)
      setLoading(false)
    }

    fetchList()
  }, [id, router])

  if (loading || !list)
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  
  return <ListDetail list={list} />
}
