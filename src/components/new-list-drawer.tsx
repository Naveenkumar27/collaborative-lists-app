"use client";

import { useState, useTransition } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * NewListDrawer allows a user to create a new list.
 * Users can specify a name and whether the list should be shared.
 */
export function NewListDrawer({
  onListCreated,
}: {
  onListCreated?: (list: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Handles the list creation process
  const handleCreateList = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !name.trim()) return;

    // Check for duplicate list names for the user (case-insensitive)
    const { data: existing } = await supabase
      .from("lists")
      .select("id")
      .eq("user_id", user.id)
      .ilike("name", name.trim());

    if (existing && existing.length > 0) {
      toast({
        variant: "destructive",
        title: "Name already in use",
        description:
          "You already have a list with this name. Try a different one.",
      });
      return;
    }

    // Insert the new list
    const { data, error } = await supabase
      .from("lists")
      .insert({
        name,
        is_shared: isShared,
        user_id: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      const userIdsToShare = [user.id];

      // If shared, assign to all users in the system
      if (isShared) {
        const { data: allUsers } = await supabase.from("users").select("id");
        const others = (allUsers || [])
          .map((u) => u.id)
          .filter((id) => id !== user.id);
        userIdsToShare.push(...others);
      }

      // Link users to the list
      await supabase
        .from("list_users")
        .insert(
          userIdsToShare.map((uid) => ({ list_id: data.id, user_id: uid }))
        );

      // Notify and reset drawer state
      const newList = {
        id: data.id,
        name: data.name,
        is_shared: data.is_shared,
        user_id: data.user_id,
      };

      setOpen(false);
      setName("");
      setIsShared(false);
      setOpen(false);

      setTimeout(() => {
        document.activeElement instanceof HTMLElement &&
          document.activeElement.blur();
      }, 0);
      toast({
        title: "List created",
        description: `✅ "${data.name}" added to your lists.`,
      });

      onListCreated?.(newList);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message,
      });
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Plus className="h-4 w-4 mr-2" /> New List
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4 space-y-4">
          <DrawerHeader>
            <DrawerTitle>Create New List</DrawerTitle>
            <DrawerDescription>
              Start fresh or share a list with your roommates.
            </DrawerDescription>
          </DrawerHeader>

          {/* List name input */}
          <Input
            placeholder="Groceries, Chores..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Shared list checkbox */}
          <label className="flex items-center space-x-2">
            <Checkbox
              id="shared"
              checked={isShared}
              onCheckedChange={() => setIsShared((prev) => !prev)}
            />
            <span>Shared list</span>
          </label>

          {/* Submit button */}
          <Button
            onClick={() => startTransition(handleCreateList)}
            disabled={isPending || name.trim() === ""}
          >
            {isPending ? "Creating..." : "Create List"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
