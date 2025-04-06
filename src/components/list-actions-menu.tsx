import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Star,
  Trash2,
  FilePlus,
  Globe,
  CopyPlus,
  Users,
} from "lucide-react";

/**
 * ListActionsMenu renders a dropdown menu with context-specific actions for a list item.
 *  Actions include favoriting, saving as template, sharing publicly, using a template, deleting, and adding to shared lists.
 */

export function ListActionsMenu({
  list,
  onToggleFavorite,
  onMarkAsTemplate,
  onTogglePublic,
  onDelete,
  onUseTemplate,
  onAddToShared,
  onRemoveFromShared,
}: {
  list: any;
  onToggleFavorite?: () => void;
  onMarkAsTemplate?: () => void;
  onTogglePublic?: () => void;
  onDelete?: () => void;
  onUseTemplate?: () => void;
  onAddToShared?: () => void;
  onRemoveFromShared?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white dark:bg-zinc-900 shadow-md border"
      >
        {onToggleFavorite && (
          <DropdownMenuItem onClick={onToggleFavorite}>
            <Star className="mr-2 h-4 w-4" />
            {list.is_favorite ? "Unfavorite" : "Mark as Favorite"}
          </DropdownMenuItem>
        )}
        {onMarkAsTemplate && (
          <DropdownMenuItem onClick={onMarkAsTemplate}>
            <FilePlus className="mr-2 h-4 w-4" />
            Save as Template
          </DropdownMenuItem>
        )}
        {/* Show 'Add to Shared Lists' only if list isn't already shared */}
        {onAddToShared && !list.is_shared && (
          <DropdownMenuItem onClick={onAddToShared}>
            <Users className="mr-2 h-4 w-4" />
            Add to Shared Lists
          </DropdownMenuItem>
        )}
        {onTogglePublic && (
          <DropdownMenuItem onClick={onTogglePublic}>
            <Globe className="mr-2 h-4 w-4" />
            {list.is_public ? "Unshare Publicly" : "Share Publicly"}
          </DropdownMenuItem>
        )}
        {onUseTemplate && (
          <DropdownMenuItem onClick={onUseTemplate}>
            <CopyPlus className="mr-2 h-4 w-4" />
            Use Template
          </DropdownMenuItem>
        )}
        {/* Show delete option only if permitted by parent (typically owner) */}
        {onDelete && (
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
