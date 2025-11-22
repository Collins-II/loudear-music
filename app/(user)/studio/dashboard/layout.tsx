import type { Metadata } from "next";
import "../../../globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/actions/getCurrentUser";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Artist - Portal",
  description: "Artist Portal Dashboard",
};

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const user = await getCurrentUser();

  if (!user || user.role !== "artist") {
    redirect("/")
  }

  // Sidebar preference
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  // Read theme cookie from next-themes (optional)
  const theme = cookieStore.get("theme")?.value || "system";

  return (
    <div
      className={cn(
        "min-h-screen flex",
        // theme applied via next-themes; server fallback helps avoid flash
        theme === "dark" && "dark bg-background text-foreground",
        theme === "light" && "bg-background text-foreground"
      )}
    >
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <SidebarInset className="flex flex-col min-h-screen bg-background/95 backdrop-blur-md border-l border-border transition-colors">
          <SiteHeader />

          <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto scrollbar-hide bg-background/80 text-foreground">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
