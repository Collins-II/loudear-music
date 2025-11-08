"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFolder,
  IconHelp,
  IconMusic,
  IconSettings,
  IconBrandSpotify,
  IconVideo,
  IconUserEdit,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Separator } from "./ui/separator"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/studio/dashboard",
      icon: IconDashboard,
    },
  ],
  contentManagement: [
    {
      name: "Submit Video",
      url: "/studio/dashboard/upload/video",
      icon: IconVideo,
    },
    {
      name: "Submit Song",
      url: "/studio/dashboard/upload/song",
      icon: IconMusic,
    },
    {
      name: "Submit Album",
      url: "/studio/dashboard/upload/album",
      icon: IconFolder,
    },
    {
      name: "Edit Profile",
      url: "/studio/dashboard/profile/edit",
      icon: IconUserEdit,
    },
  ],
  musicAndEvents: [
    {
      name: "Songs",
      url: "/studio/dashboard/admin/songs",
      icon: IconMusic,
    },
    {
      name: "Albums",
      url: "/studio/dashboard/admin/albums",
      icon: IconChartBar,
    },
    {
      name: "Videos",
      url: "/studio/dashboard/admin/videos",
      icon: IconFolder,
    },
  ],
  management: [
    {
      name: "Promotions & Marketing",
      url: "/studio/dashboard/admin/promotions",
      icon: IconBrandSpotify,
    },
   /* {
      name: "Bookings & Shows",
      url: "/studio/dashboard/admin/bookings",
      icon: IconUsers,
    },*/
    
  ],
  finance: [
    {
      name: "Financial Reports",
      url: "/studio/dashboard/admin/reports",
      icon: IconDatabase,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/studio/dashboard/admin/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/studio/dashboard/admin/help",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const user = session?.user;
  console.log("USER_SESSION", user)

  return (
    <Sidebar collapsible="offcanvas" {...props} className="pt-20">
      {/* Branding */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/studio/dashboard" className="data-[slot=sidebar-menu-button]:!p-1.5">
                <h1 className="text-1xl font-extrabold leading-tight tracking-tight md:text-2xl">
                  <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent italic">
                    {user?.stageName}
                  </span>
                </h1>
              </Link>
            {/*<SidebarMenuButton
              asChild
              
            >
              
            </SidebarMenuButton>*/}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        {/* Main */}
        <div className="px-3 pt-4">
          <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            Main
          </p>
          <NavMain items={data.navMain} />
        </div>

        {/* Content Management */}
        <div className="px-3 ">
          <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            Content Management
          </p>
          <NavDocuments items={data.contentManagement} />
        </div>

        {/* Music & Events */}
        <div className="px-3 ">
          <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            Music & Videos
          </p>
          <NavDocuments items={data.musicAndEvents} />
        </div>

        {/* Management 
        <div className="px-3 ">
          <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            Management
          </p>
          <NavDocuments items={data.management} />
        </div> */}

        {/* Finance 
        <div className="px-3 ">
          <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            Finance
          </p>
          <NavDocuments items={data.finance} />
        </div>*/}
        <Separator />

        {/* System */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* Footer */}
      {user && (
       <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      )}  
    </Sidebar>
  )
}
