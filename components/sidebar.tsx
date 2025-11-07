"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import SignInButton from "@/components/auth/SignInButton";
import { SiYoutubestudio } from "react-icons/si";
import Image from "next/image";
import { IconDotsVertical } from "@tabler/icons-react";

interface SidebarProps {
  scrolled: boolean;
  navItems: { href: string; label: string }[];
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  handleMediaClick: () => void;
}

export default function Sidebar({
  scrolled,
  navItems,
  mobileOpen,
  setMobileOpen,
  handleMediaClick,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  // Disable scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Motion variants
  const panelVariants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
    exit: { x: "100%" },
  };

  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          {/* 🔹 BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black z-[50]"
            onClick={() => setMobileOpen(false)}
          />

          {/* 🔹 SIDEBAR PANEL */}
          <motion.aside
            key="sidebar"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "tween", duration: 0.3 }}
            className={`fixed top-0 right-0 w-72 h-screen rounded-bl-xl z-[60] flex flex-col shadow-lg transition-colors duration-300
              ${scrolled ? "bg-white text-gray-900" : "bg-neutral-950 text-white"}`}
            role="dialog"
            aria-modal="true"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700/20">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2"
              >
                <span
                  className={`italic text-2xl font-extrabold transition-colors ${
                    scrolled ? "text-blue-600" : "text-white"
                  }`}
                >
                  <Image src="/assets/logo/logo-bl.jpg" alt="LOUDEAR-LOGO" width={50} height={50} className="rounded-full object-cover" />
                </span>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
                className="rounded-full"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {navItems.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-base font-semibold rounded-md px-2 py-1 transition-colors
                      ${
                        active
                          ? "text-blue-500"
                          : scrolled
                          ? "text-gray-800 hover:text-blue-600"
                          : "text-gray-300 hover:text-white"
                      }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <Separator className="opacity-20" />

            {/* FOOTER */}
            <footer className="p-6 border-t border-gray-700/30 space-y-4">
              {session ? (
                <>
                  {/* Upload Media Dropdown */}
                      <Button
                        className={`w-full justify-center uppercase rounded-full gap-2 font-semibold cursor-pointer ${
                          scrolled
                            ? "bg-gray-900 text-white hover:bg-gray-800"
                            : "bg-white text-black hover:bg-neutral-100"
                        }`}
                        onClick={() => {
                          router.push("/studio/dashboard");
                          setMobileOpen(false);
                        }}
                      >
                         Studio <SiYoutubestudio />
                      </Button>
                   

{/* 🔹 User Info Dropdown */}
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button
      className="flex items-center w-full gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted/10 focus:outline-none focus:ring-2 focus:ring-ring data-[state=open]:bg-muted"
    >
      <Avatar className="h-9 w-9 rounded-full border border-border">
        <AvatarImage src={user?.image as string} alt={user?.name as string} />
        <AvatarFallback className="rounded-full bg-muted text-muted-foreground font-medium">
          {user?.name?.[0]?.toUpperCase() ?? "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-sm leading-tight">
          {user?.name ?? "Unnamed User"}
        </p>
        <p className="truncate text-xs text-muted-foreground leading-tight">
          {user?.email ?? "No email available"}
        </p>
      </div>

      <IconDotsVertical className="ml-auto w-4 h-4 text-muted-foreground" />
    </button>
  </DropdownMenuTrigger>

  <DropdownMenuContent
    align="end"
    sideOffset={6}
    className="min-w-60 rounded-lg border border-border bg-popover p-1 shadow-lg bg-black"
  >
    <DropdownMenuLabel className="px-3 py-2 font-normal">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 rounded-full border border-border">
          <AvatarImage src={user?.image as string} alt={user?.name as string} />
          <AvatarFallback className="rounded-full bg-muted text-muted-foreground font-medium">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col text-sm leading-tight">
          <span className="font-medium truncate text-white">
            {user?.name ?? "User"}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {user?.email ?? ""}
          </span>
        </div>
      </div>
    </DropdownMenuLabel>

    <DropdownMenuSeparator />

    {/* Example of future user settings if needed */}
    {/* <DropdownMenuItem onClick={() => router.push("/account")} className="gap-2">
      <UserCircle2 className="w-4 h-4" /> Account Settings
    </DropdownMenuItem> */}

    <DropdownMenuItem
      onClick={() => signOut()}
      className="gap-2 text-sm font-medium text-destructive focus:text-destructive hover:text-destructive"
    >
      <LogOut className="w-4 h-4" />
      Log out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

                </>
              ) : (
                <>
                  <Button
                        className={`w-full justify-center uppercase rounded-full gap-2 font-semibold cursor-pointer ${
                          scrolled
                            ? "bg-gray-900 text-white hover:bg-gray-800"
                            : "bg-white text-black hover:bg-neutral-100"
                        }`}
                        onClick={handleMediaClick}
                      >
                         Studio <SiYoutubestudio />
                  </Button>
                  <div className="pt-2">
                    <SignInButton />
                  </div>
                </>
              )}
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
