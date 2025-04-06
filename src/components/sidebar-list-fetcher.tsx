// SidebarListFetcher manages and displays personal, shared, and template lists.
// It handles actions like marking lists as favorite, template, shared, or public,
// and allows duplication or deletion of lists depending on permissions.

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Folder, Users, LayoutTemplate } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { SidebarListSection } from "@/components/sidebar-list-section";


/**
 * SidebarListFetcher manages and displays personal, shared, and template lists.
 * It handles actions like marking lists as favorite, template, shared, or public, and allows duplication or deletion of lists depending on permissions.
 */
export function SidebarListFetcher() {
  // Store different list views separately
  const [personalLists, setPersonalLists] = useState<any[]>([]);
  const [sharedLists, setSharedLists] = useState<any[]>([]);
  const [templateLists, setTemplateLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const { toast } = useToast();

  // Fetch lists and categorize by type: personal, shared, or template
  const fetchLists = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    if (!user) return;

    try {
      // Personal: private lists owned by the user
      const { data: personal } = await supabase
        .from("lists")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_shared", false);

      // Shared: lists visible to all users
      const { data: shared } = await supabase
        .from("lists")
        .select("*")
        .eq("is_shared", true);

      // Templates: reusable list blueprints (only the user's own)
      const { data: templates } = await supabase
        .from("lists")
        .select("*")
        .eq("is_template", true)
        .eq("user_id", user.id);

      setPersonalLists((personal || []).filter((l) => !l.is_template));
      setTemplateLists((templates || []).filter((l) => l.is_template));
      setSharedLists(shared || []);
      setTemplateLists(templates || []);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to load lists",
        description: err.message,
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists(true);
  }, [user]);

  const handleListCreated = () => fetchLists();

  // Toggle the favorite status of a list
  const toggleFavorite = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("lists")
      .update({ is_favorite: !current })
      .eq("id", id);

    if (!error) {
      toast({ title: !current ? "Marked as Favorite!" : "Unfavorited" });
      fetchLists();
    }
  };

  // Clone a list and its items into a new list marked as a template
  const markAsTemplate = async (id: string) => {
    const original = [...personalLists, ...sharedLists].find((l) => l.id === id);
    if (!original) return;

    const existingTemplate = templateLists.find((t) => t.name === `${original.name} (T)`);
    if (existingTemplate) {
      toast({ title: "Template already exists!", description: "You already have a template with this name." });
      return;
    }

    const { data: newTemplate, error: cloneError } = await supabase
      .from("lists")
      .insert({
        name: `${original.name} (T)`,
        is_template: true,
        user_id: user?.id,
        is_shared: false,
        is_favorite: false,
        is_public: false
      })
      .select()
      .single();

    if (cloneError || !newTemplate) {
      toast({ variant: "destructive", title: "Could not create template", description: cloneError?.message });
      return;
    }

    const { data: items } = await supabase
      .from("items")
      .select("content")
      .eq("list_id", id);

    if (items && items.length > 0) {
      await supabase.from("items").insert(
        items.map((item) => ({ content: item.content, list_id: newTemplate.id }))
      );
    }

    toast({ title: "Saved as Template!" });
    fetchLists();
  };

  // Delete a list if the user owns it
  const deleteList = async (id: string) => {
    const list = [...personalLists, ...sharedLists, ...templateLists].find((l) => l.id === id);
    if (!list) return;

    if (list.user_id !== user?.id) {
      toast({ title: "Only the owner can delete this list." });
      return;
    }

    const confirm = window.confirm("Delete this list?");
    if (!confirm) return;

    const { error } = await supabase.from("lists").delete().eq("id", id);
    if (!error) {
      toast({ title: "List deleted!" });
      fetchLists();
    }
  };

  // Remove template flag only, not the actual list
  const deleteTemplateOnly = async (id: string) => {
    const { error } = await supabase.from("lists").delete().eq("id", id);

    if (!error) {
      toast({ title: "Removed from Templates" });
      fetchLists();
    }
  };

  // Create a new list and copy over items from a selected template
  const useTemplate = async (templateId: string, name: string) => {
    if (!user) return;

    const newName = prompt("Name your new list:", `${name} (copy)`);
    if (!newName || !newName.trim()) return;

    const { data: newList, error: listErr } = await supabase
      .from("lists")
      .insert({
        name: newName,
        is_shared: false,
        user_id: user.id,
      })
      .select()
      .single();

    if (listErr || !newList) {
      toast({ variant: "destructive", title: "Error", description: listErr?.message });
      return;
    }

    const { data: items } = await supabase
      .from("items")
      .select("content")
      .eq("list_id", templateId);

    if (items && items.length > 0) {
      await supabase.from("items").insert(
        items.map((item) => ({ content: item.content, list_id: newList.id }))
      );
    }

    toast({ title: "Template used!", description: "New list created" });
    fetchLists();
  };

  // Toggle a list's public visibility and handle link copying
  const togglePublic = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("lists")
      .update({ is_public: !current })
      .eq("id", id);

    if (!error) {
      const url = `${window.location.origin}/view/${id}`;

      if (!current) {
        await navigator.clipboard.writeText(url);
        toast({
          title: "List shared publicly!",
          description: "🔗 Link copied to clipboard!",
        });
      } else {
        toast({ title: "List is no longer public" });
      }

      fetchLists();
    }
  };

  // Allow users to mark their list as shared with roommates
  const addToSharedLists = async (id: string) => {
    const { error } = await supabase
      .from("lists")
      .update({ is_shared: true })
      .eq("id", id);

    if (!error) {
      toast({ title: "Added to Shared Lists" });
      fetchLists();
    } else {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="overflow-y-auto max-h-screen md:max-h-[calc(100vh-48px)] bg-background">
      <SidebarListSection
        title="Your Lists"
        icon={<Folder className="h-4 w-4" />}
        lists={personalLists}
        loading={loading}
        onListCreated={handleListCreated}
        onFavorite={toggleFavorite}
        onTemplate={markAsTemplate}
        onDelete={deleteList}
        onTogglePublic={togglePublic}
        onAddToShared={addToSharedLists}
      />

      {sharedLists.length > 0 && (
        <SidebarListSection
          title="Shared Lists"
          icon={<Users className="h-4 w-4" />}
          lists={sharedLists}
          onFavorite={toggleFavorite}
          onTemplate={markAsTemplate}
          onDelete={deleteList}
          onTogglePublic={togglePublic}
        />
      )}

      {templateLists.length > 0 && (
        <SidebarListSection
          title="Templates"
          icon={<LayoutTemplate className="h-4 w-4" />}
          lists={templateLists}
          onUseTemplate={useTemplate}
          onDelete={deleteTemplateOnly}
          isTemplateSection
        />
      )}
    </div>
  );
}
