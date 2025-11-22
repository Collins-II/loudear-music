// components/auth/SignInButton.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { RiLoginCircleFill } from "react-icons/ri";
import { motion } from "framer-motion";
import {  LogOut,   Wallet, Users, User} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInButton() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const [accountOpen, setAccountOpen] = useState(false)

  if (status === "loading") {
    return <Button className="rounded-full" disabled>Loading…</Button>;
  }

  if (!session) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/auth')}
        className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 rounded-full px-4 py-2 shadow-sm"
      >
        <RiLoginCircleFill  className="text-black" />
        <p className="hidden lg:block text-gray-700 text-sm font-medium">SignIn</p>
      </motion.div>
    );
  }

   

  return (
        <Popover open={accountOpen} onOpenChange={setAccountOpen}>
          <PopoverTrigger asChild>
            <Avatar className="cursor-pointer h-8 w-8">
              <AvatarImage src={user?.image as string} />
              <AvatarFallback>CM</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
  
          <PopoverContent className="bg-white dark:bg-black/90 text-black/90 dark:text-white w-56 p-0">
            <div className="p-3 border-b">
              <div className="font-medium">{user?.stageName || user?.name}</div>
              <div className="text-xs text-muted-foreground">User Account</div>
            </div>
  
            <div className="flex flex-col p-1">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <User size={16} /> Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Users size={16} /> Creator Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Wallet size={16} /> My Subscriptions
              </Button>
              <Button onClick={() => signOut()} variant="ghost" className="w-full justify-start gap-2 text-red-500">
                <LogOut size={16} /> Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
  );
}
