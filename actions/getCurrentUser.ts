"use server";

import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/database";
import { User } from "@/lib/database/models/user";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getCurrentUser() {
  await connectToDatabase();

  // ✅ Get the current session on the server
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await User.findOne({ email: session.user.email }).lean();
  return user ? { ...user, _id: user._id.toString() } : null;
}
