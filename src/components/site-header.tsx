"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";

/**
 * SiteHeader appears at the top of the app, displaying:
 * - The RoomieLists title
 * - A sidebar toggle
 * - The current user's avatar
 * - A logout button
 */
export function SiteHeader() {
  const router = useRouter();
  const user = useUser();

  // Handle user logout and redirect to login
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Extract user's initials for Avatar fallback (safe default)
  const initials = (
    (user?.user_metadata?.first_name?.[0] || "") +
    (user?.user_metadata?.last_name?.[0] || "")
  ).toUpperCase();

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between gap-2 px-4 lg:px-6">
        {/* Left: Sidebar toggle + title */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <Link href="/dashboard" className="text-base text-xl font-bold">
            🧺 RoomieLists
          </Link>
        </div>

        {/* Right: User avatar and logout */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border-2 border-gray-200 bg-gray-100">
            <AvatarImage
              src={user?.user_metadata?.avatar_url}
              alt="user avatar"
            />
            <AvatarFallback className="text-sm font-semibold text-white bg-blue-500 rounded-full">
              {initials || "👤"}
            </AvatarFallback>
          </Avatar>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
