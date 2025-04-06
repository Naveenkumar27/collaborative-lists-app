"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Folder, Users, LayoutTemplate } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { SidebarListSection } from "@/components/sidebar-list-section";

export function SidebarListFetcher() {
  const [personalLists, setPersonalLists] = useState<any[]>([]);
  const [sharedLists, setSharedLists] = useState<any[]>([]);
  const [templateLists, setTemplateLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const { toast } = useToast();

  const fetchLists = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    if (!user) return;

    try {
      const { data: personal } = await supabase
        .from("lists")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_shared", false);

      const { data: shared } = await supabase
        .from("lists")
        .select("*")
        .eq("is_shared", true);

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

  const markAsTemplate = async (id: string) => {
    const original = [...personalLists, ...sharedLists].find((l) => l.id === id);
    if (!original) return;

    // Check if a template with the same name already exists
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

  const deleteTemplateOnly = async (id: string) => {
    const { error } = await supabase.from("lists").delete().eq("id", id);

    if (!error) {
      toast({ title: "Removed from Templates" });
      fetchLists();
    }
  };

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
