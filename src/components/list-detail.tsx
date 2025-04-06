"use client"

import { useEffect, useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

/**
 * ListDetail is the main view for a specific list (e.g. "Groceries").
 * It fetches items for the list and allows the user to add, check, or delete them.
 */
export function ListDetail({
  list,
}: {
  list: { id: string; name: string; is_shared: boolean }
}) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  // Fetch all items for this list on mount or when list changes
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("items")
        .select("id, content, checked")
        .eq("list_id", list.id)
        .order("created_at", { ascending: true })

      if (!error && data) setItems(data)
      setLoading(false)
    }

    fetchItems()
  }, [list.id])

  // Add a new item to the list
  const handleAddItem = async () => {
    if (!newItem.trim()) return

    const { data, error } = await supabase
      .from("items")
      .insert({ content: newItem, list_id: list.id })
      .select()

    if (!error && data?.length) {
      setItems((prev) => [...prev, data[0]])
      setNewItem("")
    } else {
      toast({
        variant: "destructive",
        title: "Could not add item",
        description: error?.message || "Unknown error",
      })
    }
  }

  // Toggle the 'checked' state of an item
  const toggleChecked = async (itemId: string, newChecked: boolean) => {
    const { error } = await supabase
      .from("items")
      .update({ checked: newChecked })
      .eq("id", itemId)

    if (!error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, checked: newChecked } : item
        )
      )
    } else {
      toast({
        variant: "destructive",
        title: "Could not update item",
        description: error.message,
      })
    }
  }

  // Delete an item from the list
  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase.from("items").delete().eq("id", itemId)

    if (!error) {
      setItems((prev) => prev.filter((item) => item.id !== itemId))
    } else {
      toast({
        variant: "destructive",
        title: "Could not delete item",
        description: error.message,
      })
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      {/* Loading spinner */}
      {loading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* List name header */}
          <h2 className="text-2xl font-semibold mb-4">📝 {list.name}</h2>

          {/* Display each item */}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between space-x-2"
              >
                {/* Checkbox + label */}
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={(checked) =>
                      toggleChecked(item.id, Boolean(checked))
                    }
                  />
                  <span
                    className={
                      item.checked ? "line-through text-muted-foreground" : ""
                    }
                  >
                    {item.content}
                  </span>
                </label>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑
                </Button>
              </div>
            ))}
          </div>

          {/* New item input */}
          <div className="mt-6 flex gap-2">
            <Input
              placeholder="Add a new item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />
            <Button
              onClick={() => startTransition(handleAddItem)}
              disabled={isPending}
            >
              Add
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
