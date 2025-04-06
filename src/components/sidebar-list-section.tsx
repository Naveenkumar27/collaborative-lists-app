"use client";

import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { NewListDrawer } from "@/components/new-list-drawer";
import { ListActionsMenu } from "@/components/list-actions-menu";
import { ListTodo, Star, FilePlus } from "lucide-react";
import { useUser } from "@/contexts/user-context";

interface SidebarListSectionProps {
  title: string;
  icon: React.ReactNode;
  lists: any[];
  loading?: boolean;
  onListCreated?: () => void;
  onFavorite?: (id: string, current: boolean) => void;
  onTemplate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTogglePublic?: (id: string, current: boolean) => void;
  onUseTemplate?: (id: string, name: string) => void;
  onAddToShared?: (id: string) => void;
  isTemplateSection?: boolean;
}

export function SidebarListSection({
  title,
  icon,
  lists,
  loading,
  onListCreated,
  onFavorite,
  onTemplate,
  onDelete,
  onTogglePublic,
  onAddToShared,
  onUseTemplate,
  isTemplateSection,
}: SidebarListSectionProps) {
  const user = useUser();
  return (
    <SidebarGroup>
      {/* Section title with icon */}
      <SidebarGroupLabel className="text-xl pb-2 flex items-center gap-2">
        {icon} <span className="truncate">{title}</span>
      </SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu>
          {/* Show loading skeletons while fetching */}
          {loading ? (
            <>
              <SidebarMenuItem>
                <Skeleton className="h-6 w-[80%] ml-2" />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Skeleton className="h-6 w-[70%] ml-2" />
              </SidebarMenuItem>
            </>
          ) : lists.length === 0 && !isTemplateSection ? (
            // Show "No lists" if nothing exists and it's not a template section
            <SidebarMenuItem>
              <span className="text-muted-foreground px-4">No lists</span>
            </SidebarMenuItem>
          ) : (
            // Render list items
            lists.map((list) => (
              <SidebarMenuItem
                key={list.id}
                className="flex justify-between items-center pr-2"
              >
                {/* Left side: either a template or a normal list */}
                <SidebarMenuButton asChild>
                  {isTemplateSection ? (
                    // Template section: display template icon and name
                    <div className="flex items-center gap-2 text-muted-foreground px-2">
                      <FilePlus className="h-4 w-4 shrink-0" />
                      <span className="truncate">{list.name}</span>
                    </div>
                  ) : (
                    // Regular list: link to the list detail page
                    <Link
                      href={`/list/${list.id}`}
                      className="flex items-center gap-2 overflow-hidden"
                    >
                      <ListTodo className="h-4 w-4 shrink-0" />
                      <span className="truncate">{list.name}</span>
                      {list.is_favorite && (
                        <Star className="ml-1 h-3 w-3 text-yellow-500 shrink-0" />
                      )}
                    </Link>
                  )}
                </SidebarMenuButton>

                {/* Right side: Actions menu (favorite, delete, share, etc.) */}
                <ListActionsMenu
                  list={list}
                  onToggleFavorite={
                    onFavorite
                      ? () => onFavorite(list.id, list.is_favorite)
                      : undefined
                  }
                  onMarkAsTemplate={
                    onTemplate ? () => onTemplate(list.id) : undefined
                  }
                  onTogglePublic={
                    onTogglePublic
                      ? () => onTogglePublic(list.id, list.is_public)
                      : undefined
                  }
                  onDelete={onDelete ? () => onDelete(list.id) : undefined}
                  onUseTemplate={
                    onUseTemplate
                      ? () => onUseTemplate(list.id, list.name)
                      : undefined
                  }
                  onAddToShared={
                    onAddToShared ? () => onAddToShared(list.id) : undefined
                  }
                />
              </SidebarMenuItem>
            ))
          )}

          {/* Show "New List" button if handler is passed */}
          {onListCreated && (
            <SidebarMenuItem>
              <div className="w-full text-center">
                <NewListDrawer onListCreated={onListCreated} />
              </div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
