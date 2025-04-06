import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { ListItem } from "@/components/list-item"
import { Separator } from "@/components/ui/separator"

/**
 * ViewListPage is a public page for viewing a single shared list.
 * It fetches the list (only if it's public) and its items,
 * then renders them in a simple read-only layout.
 */
export default async function ViewListPage({ params }: { params: { id: string } }) {
  // Create Supabase server client with cookie context
  const supabase = createServerComponentClient({ cookies })

  // Fetch the public list based on the ID from the URL
  const { data: list, error: listError } = await supabase
    .from("lists")
    .select("id, name")
    .eq("id", params.id)
    .eq("is_public", true) // Only allow public lists
    .single()

  // If list is not found or not public, show 404 page
  if (!list || listError) return notFound()

  // Fetch all items in this list, sorted by creation time
  const { data: items } = await supabase
    .from("items")
    .select("id, content, checked")
    .eq("list_id", list.id)
    .order("created_at", { ascending: true })

  return (
    <div className="max-w-lg mx-auto p-6">
      {/* List title */}
      <h1 className="text-2xl font-semibold text-center mb-4">{list.name}</h1>

      <Separator className="mb-4" />

      {/* Render items or a fallback message */}
      <ul className="space-y-2">
        {items?.length === 0 ? (
          <p className="text-muted-foreground text-sm">No items in this list.</p>
        ) : (
          items?.map((item) => (
            <ListItem
              key={item.id}
              content={item.content}
              checked={item.checked}
              readOnly // Ensures this is a view-only version
            />
          ))
        )}
      </ul>
    </div>
  )
}
