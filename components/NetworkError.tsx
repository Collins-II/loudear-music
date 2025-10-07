"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NetworkError() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6 space-y-4">
      <AlertTriangle className="w-12 h-12 text-yellow-500" />
      <h2 className="text-2xl font-bold text-black/70">Network Connection Issue</h2>
      <p className="text-muted-foreground max-w-md">
        We’re having trouble connecting to our servers. Please check your internet connection or try again shortly.
      </p>
      <Button
        onClick={() => window.location.reload()}
        className="mt-2 rounded-xl"
      >
        Retry
      </Button>
    </div>
  );
}
