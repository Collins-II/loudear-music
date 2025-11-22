"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "./ui/breadcrumb";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { NavActions } from "./nav-actions";

export function SiteHeader() {
  const { data: session } = useSession();
  const user = session?.user;

  const pathname = usePathname();

  const pageTitle =
    pathname === "/dashboard/upload/song"
      ? "UPLOAD"
      : pathname === "/dashboard/upload/video"
      ? "UPLOAD"
      : pathname === "/dashboard/profile/edit"
      ? "PROFILE"
      : pathname === "/dashboard/upload/album"? "UPLOAD"
      : "";

  return (
    <header className="relative flex w-full items-center justify-between overflow-hidden bg-black text-white">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/bizzy03.jpg"
          alt="BACKGROUND_COVER"
          fill
          priority
          className="object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>

      {/* Left Side */}
      <div className="relative z-10 flex flex-1 items-center gap-3 px-4 md:px-6 py-6">
        <SidebarTrigger className="bg-white text-black shadow-md rounded-full p-2 hover:bg-gray-200 transition" />

        <Separator
          orientation="vertical"
          className="h-6 bg-white/40 hidden sm:block"
        />

        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1 flex items-center">
                <span className="inline-block rounded-full bg-white/10 px-3 py-1 capitalize font-bold text-xs sm:text-sm text-white/80 backdrop-blur-md">
                  {user?.role} • {user?.location}
                </span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right Side */}
      <div className="relative z-10 ml-auto px-4 md:px-6 py-6 text-right">
        <h1 className="flex flex-col sm:flex-row sm:items-center sm:gap-3 font-extrabold leading-tight tracking-tight">
          <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent text-3xl md:text-5xl lg:text-6xl">
            Portal
          </span>
          <span className="mt-1 sm:mt-0 block text-base md:text-xl lg:text-2xl text-white">
            {pageTitle}
          </span>
        </h1>
        {/* Uncomment if needed */}
        <NavActions />
      </div>
    </header>
  );
}
