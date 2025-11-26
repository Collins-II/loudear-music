"use client";

import {
  Home,
  Plus,
  Music2,
  Disc3,
  Video,
  User,
  ShoppingBasket,
  Wallet,
  Layers3,
  Music3Icon,
  DollarSign,
  Wallet2,
  TrendingUpDown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";

import Link from "next/link";
import { Sheet, SheetTrigger } from "./ui/sheet";

import AddOrder from "./AddOrder";
import AddUser from "./AddUser";
import AddCategory from "./AddCategory";
import AddProduct from "./AddProduct";

import { useSession } from "next-auth/react";
import { NavUser } from "./nav-user";
import AddBeatForm from "./studio/forms/AddBeatForm";
import AddVideoForm from "./studio/forms/AddVideoForm";
import { TbMoneybag } from "react-icons/tb";

const items = [
  {
    title: "Analytics",
    url: "/studio/dashboard/admin/analytics",
    icon: Home,
  },
  {
    title: "Monetization",
    url: "/studio/dashboard/admin/monetization",
    icon: DollarSign,
  },
  {
    title: "Wallet",
    url: "/studio/dashboard/admin/wallet",
    icon: Wallet2,
  },
  {
    title: "Royalties",
    url: "/studio/dashboard/admin/royalty-splits",
    icon: TbMoneybag,
  },
    {
    title: "Marketing",
    url: "/studio/dashboard/admin/marketing",
    icon: TrendingUpDown,
  },
];

const AppSidebar = () => {
  const { data: session } = useSession();
  const user = session?.user;
  console.log("SESSION_USER", user)

  return (
    <Sidebar collapsible="icon">
      
      {/* HEADER */}
      <SidebarHeader className="pt-24 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/studio/dashboard"
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <h1 className="text-xl font-extrabold leading-tight tracking-tight md:text-2xl">
                  <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent italic">
                    {user?.stageName || user?.name || "Artist Studio"}
                  </span>
                </h1>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* BODY */}
      <SidebarContent>

        {/* MAIN */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SONGS */}
        <SidebarGroup>
          <SidebarGroupLabel>Songs</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Add Song</span>
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/studio/dashboard/admin/songs">
                    <Music2 />
                    <span>All Songs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton>
                      <Plus /> Add Song
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddProduct />
                </Sheet>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton>
                      <Layers3 /> Add Category
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddCategory />
                </Sheet>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* BEATS */}
        <SidebarGroup>
          <SidebarGroupLabel>Beats</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Add Beat</span>
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/studio/dashboard/admin/beats">
                    <Music3Icon />
                    <span>All Beats</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton>
                      <Plus /> Add Beat
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddBeatForm />
                </Sheet>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton>
                      <Layers3 /> Add Category
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddCategory />
                </Sheet>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ALBUMS */}
        <SidebarGroup>
          <SidebarGroupLabel>Albums / EPs</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Add Album</span>
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/studio/dashboard/admin/albums">
                    <Disc3 />
                    <span>All Albums</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton>
                      <Plus /> Add Album
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddProduct />
                </Sheet>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton>
                      <Layers3 /> Add Category
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddCategory />
                </Sheet>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* VIDEOS */}
        <SidebarGroup>
          <SidebarGroupLabel>Videos</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Add Video</span>
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/studio/dashboard/admin/videos">
                    <Video />
                    <span>All Videos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton>
                      <Plus /> Add Video
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddVideoForm />
                </Sheet>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton>
                      <Layers3 /> Add Category
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddCategory />
                </Sheet>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* USERS */}
        <SidebarGroup>
          <SidebarGroupLabel>Users</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Add User</span>
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/studio/dashboard/users">
                    <User />
                    <span>All Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton>
                      <Plus /> Add User
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddUser />
                </Sheet>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ORDERS / PAYMENTS */}
        <SidebarGroup>
          <SidebarGroupLabel>Orders & Earnings</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Add Order</span>
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/studio/dashboard/transactions">
                    <Wallet />
                    <span>Transactions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton>
                      <ShoppingBasket />
                      <span>Add Order</span>
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddOrder />
                </Sheet>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

        {/* Footer */}
        {user && (
         <SidebarFooter>
          <NavUser />
        </SidebarFooter>
        )} 
    </Sidebar>
  );
};

export default AppSidebar;
