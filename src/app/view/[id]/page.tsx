import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { ListItem } from "@/components/list-item"
import { Separator } from "@/components/ui/separator"

export default async function ViewListPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  const { data: list, error: listError } = await supabase
    .from("lists")
    .select("id, name")
    .eq("id", params.id)
    .eq("is_public", true)
    .single()

  if (!list || listError) return notFound()

  const { data: items } = await supabase
    .from("items")
    .select("id, content, checked")
    .eq("list_id", list.id)
    .order("created_at", { ascending: true })

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold text-center mb-4">{list.name}</h1>
      <Separator className="mb-4" />
      <ul className="space-y-2">
        {items?.length === 0 ? (
          <p className="text-muted-foreground text-sm">No items in this list.</p>
        ) : (
          items?.map((item) => (
            <ListItem
              key={item.id}
              content={item.content}
              checked={item.checked}
              readOnly
            />
          ))
        )}
      </ul>
    </div>
  )
}
