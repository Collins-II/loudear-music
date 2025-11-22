"use client"

import * as React from "react"
import {
  Settings2, LineChart, FileText, Copy, ArrowUp, ArrowDown,
  Bell, Trash2, Users, Wallet, Globe
} from "lucide-react"

import { CiSettings } from "react-icons/ci"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Popover, PopoverTrigger, PopoverContent
} from "@/components/ui/popover"

import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem
} from "@/components/ui/sidebar"
import CurrencyDropdown from "./currency-popover"


// ----------------------------
// LOADEAR MENU
// ----------------------------
const menuGroups = [
  [
    { label: "Customize LoudEar Page", icon: Settings2 },
    { label: "Artist Dashboard", icon: LineChart },
    { label: "Manage Subscriptions", icon: Wallet },
  ],
  [
    { label: "Copy Track Link", icon: Copy },
    { label: "Upload New Track", icon: ArrowUp },
    { label: "Export Analytics", icon: ArrowDown },
  ],
  [
    { label: "Content Policy", icon: FileText },
    { label: "Creators / Artists", icon: Users },
    { label: "Notifications", icon: Bell },
    { label: "Delete Track", icon: Trash2 },
  ],
]


export function NavActions() {
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [notifOpen, setNotifOpen] = React.useState(false)

  const { theme, setTheme } = useTheme()

  // 🔔 Notifications State
  const [notifications, setNotifications] = React.useState([
    { id: 1, read: false, text: "New follower on your Artist Page" },
    { id: 2, read: false, text: "Your track reached 1,000 streams" },
  ])
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((list) => list.map((n) => ({ ...n, read: true })))
  }

  // 🗓 Date
  const formattedDate = React.useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
  }, [])

  // 🪄 Auto-detect currency by IP



  return (
    <div className="flex items-center gap-3 text-sm">

      {/* DATE */}
      <div className="hidden md:inline-block text-white italic font-medium">
        {formattedDate}
      </div>

      {/* STAR 
      <Button variant="ghost" size="icon" className="h-7 w-7">
        <Star />
      </Button>*/}

      {/* 🔔 NOTIFICATIONS */}
      <Popover
        open={notifOpen}
        onOpenChange={(o) => {
          setNotifOpen(o)
          if (o) markAllRead()
        }}
      >
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 relative">
            <Bell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="bg-white dark:bg-black/90 w-72 p-3 rounded-xl shadow-lg">
          <div className="font-medium mb-3">Notifications</div>

          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-2 text-sm rounded-md ${
                  n.read ? "bg-transparent" : "bg-accent"
                }`}
              >
                {n.text}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* ⚙️ SETTINGS MENU */}
      <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 data-[state=open]:bg-accent"
          >
            <CiSettings />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-72 max-h-[80vh] bg-white dark:bg-black/90 rounded-lg p-0 overflow-y-auto"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>

              {/* THEME SWITCH */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="flex items-center gap-2 text-sm">
                  <Globe size={16} /> Theme
                </span>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
                />
              </div>

              {/* 🌍 CURRENCY PICKER 
              */}
              <CurrencyDropdown/>
              {/* ACTION MENU ITEMS */}
              {menuGroups.map((group, index) => (
                <SidebarGroup key={index} className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item, i) => (
                        <SidebarMenuItem key={i}>
                          <SidebarMenuButton>
                            <item.icon /> <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}

            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  )
}
