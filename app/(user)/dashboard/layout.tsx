import type { Metadata } from "next";
import "../../globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils"; // utility for merging classes (if you have this helper)
import { QueryProvider } from "@/lib/provider/query-provider";

export const metadata: Metadata = {
  title: "Artist - Portal",
  description: "Artist Portal Dashboard",
};

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className={cn("dark min-h-screen bg-background text-foreground flex")}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        {/* Sidebar */}
        <AppSidebar variant="inset" />

        {/* Main Content Area */}
        <SidebarInset className="flex flex-col min-h-screen bg-background/95 backdrop-blur-md border-l border-border transition-colors">
          {/* Header */}
          <SiteHeader />

          {/* Page Content */}
          <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto scrollbar-hide bg-background/80 text-foreground">
          <QueryProvider>
            {children}
          </QueryProvider>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
