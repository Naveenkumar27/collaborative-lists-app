"use client"

import { cn } from "@/lib/utils"
import { CheckCircle } from "lucide-react"

/**
 * Displays a single item in a list, optionally with a checked state.
 * The item is styled as crossed out when checked.
 */
export function ListItem({
  content,
  checked,
  readOnly = false,
}: {
  content: string
  checked: boolean
  readOnly?: boolean
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 px-3 py-2 border rounded-md",
        checked && "line-through text-muted-foreground"
      )}
    >
      <CheckCircle
        className={cn("h-5 w-5", checked ? "text-green-500" : "text-gray-300")}
      />
      <span>{content}</span>
    </li>
  )
}
