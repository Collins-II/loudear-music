// components/auth/SignInButton.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";
import { LogOut, User, LayoutDashboard } from "lucide-react";
import { HiOutlineChevronUpDown } from "react-icons/hi2";

export default function SignInButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Button className="rounded-full" disabled>Loading…</Button>;
  }

  if (!session) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => signIn("google")}
        className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 rounded-full px-4 py-2 shadow-sm"
      >
        <FaGoogle className="text-black" />
        <p className="hidden lg:block text-gray-700 text-sm font-medium">Sign in with Google</p>
      </motion.div>
    );
  }

  return (
    <DropdownMenu >
      <DropdownMenuTrigger className="bg-transparent" asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1 rounded-full focus:outline-none"
        >
          <Image
            src={session.user?.image ?? "/assets/images/avatar-placeholder.png"}
            alt={session.user?.name ?? "avatar"}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
          <HiOutlineChevronUpDown className="w-4 h-4 text-gray-500"/>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white w-48">
        <DropdownMenuLabel>
          <p className="text-black font-medium">{session.user?.name}</p>
          <p className="text-xs text-gray-500 truncate">
            {session.user?.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-gray-700 text-xs font-semibold">
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-700 text-xs font-semibold">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
