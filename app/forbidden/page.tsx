"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-center p-8">
      <h1 className="text-5xl font-bold text-destructive mb-4">403</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        You don’t have permission to access this page. Please make sure you’re signed in with the correct account.
      </p>
      <div className="flex gap-4">
        <Button variant="ghost" onClick={() => router.push("/")}>
          Go Home
        </Button>
        <Button onClick={() => router.push("/auth")}>
          Sign In Again
        </Button>
      </div>
    </div>
  );
}
