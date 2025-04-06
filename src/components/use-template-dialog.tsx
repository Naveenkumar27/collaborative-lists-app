"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { NewListDrawer } from "@/components/new-list-drawer"
import { useToast } from "@/hooks/use-toast"
import { ListTodo, MoreHorizontal, Star, Trash2, FilePlus, CopyPlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { UseTemplateDialog } from "@/components/use-template-dialog"

export function SidebarListFetcher() {
  const [lists, setLists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const { toast } = useToast()

  const fetchLists = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLists([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("lists")
      .select("id, name, is_favorite, is_template")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!error && data) setLists(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLists()
  }, [])

  const handleListCreated = (newList: any) => {
    setLists((prev) => [newList, ...prev])
  }

  const toggleFavorite = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("lists")
      .update({ is_favorite: !current })
      .eq("id", id)

    if (!error) {
      setLists((prev) =>
        prev.map((list) =>
          list.id === id ? { ...list, is_favorite: !current } : list
        )
      )
      toast({ title: !current ? "Marked as Favorite" : "Unfavorited" })
    }
  }

  const markAsTemplate = async (id: string) => {
    const { error } = await supabase
      .from("lists")
      .update({ is_template: true })
      .eq("id", id)

    if (!error) toast({ title: "Saved as Template" })
  }

  const deleteList = async (id: string) => {
    const confirm = window.confirm("Delete this list?")
    if (!confirm) return

    const { error } = await supabase.from("lists").delete().eq("id", id)

    if (!error) {
      setLists((prev) => prev.filter((list) => list.id !== id))
      toast({ title: "List deleted" })
    }
  }

  const userLists = lists.filter((l) => !l.is_template)
  const templates = lists.filter((l) => l.is_template)

  return (
    <>
      <UseTemplateDialog
        template={selectedTemplate}
        open={templateDialogOpen}
        onClose={() => {
          setTemplateDialogOpen(false)
          setSelectedTemplate(null)
        }}
        onCreated={fetchLists}
      />

      <SidebarGroup>
        <SidebarGroupLabel>Your Lists</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {loading ? (
              <>
                <SidebarMenuItem><Skeleton className="h-6 w-[80%] ml-2" /></SidebarMenuItem>
                <SidebarMenuItem><Skeleton className="h-6 w-[70%] ml-2" /></SidebarMenuItem>
              </>
            ) : userLists.length === 0 ? (
              <SidebarMenuItem>
                <span className="text-muted-foreground px-4">No lists yet</span>
              </SidebarMenuItem>
            ) : (
              userLists.map((list) => (
                <SidebarMenuItem key={list.id} className="flex justify-between items-center pr-2">
                  <SidebarMenuButton asChild>
                    <Link
                      href={`/list/${list.id}`}
                      className="flex items-center gap-2 overflow-hidden"
                    >
                      <ListTodo className="h-4 w-4 shrink-0" />
                      <span className="truncate">{list.name}</span>
                      {list.is_favorite && <Star className="ml-1 h-3 w-3 text-yellow-500 shrink-0" />}
                    </Link>
                  </SidebarMenuButton>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleFavorite(list.id, list.is_favorite)}>
                        <Star className="mr-2 h-4 w-4" />
                        {list.is_favorite ? "Unfavorite" : "Mark as Favorite"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => markAsTemplate(list.id)}>
                        <FilePlus className="mr-2 h-4 w-4" />
                        Save as Template
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteList(list.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))
            )}
            <SidebarMenuItem>
              <NewListDrawer onListCreated={handleListCreated} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {templates.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Templates</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {templates.map((tpl) => (
                <SidebarMenuItem key={tpl.id} className="flex justify-between items-center pr-2">
                  <SidebarMenuButton asChild>
                    <div className="flex items-center gap-2 text-muted-foreground px-2">
                      <FilePlus className="h-4 w-4 shrink-0" />
                      <span className="truncate">{tpl.name}</span>
                    </div>
                  </SidebarMenuButton>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedTemplate(tpl)
                        setTemplateDialogOpen(true)
                      }}>
                        <CopyPlus className="mr-2 h-4 w-4" />
                        Use Template
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteList(tpl.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  )
}
