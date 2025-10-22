"use client"

import { useEffect, useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getSocket } from "@/lib/socketClient"

interface StanButtonProps {
  artistId: string
  initialStanCount?: number
}

export function StanButton({ artistId, initialStanCount = 0 }: StanButtonProps) {
  const socket = getSocket()
  const [isStan, setIsStan] = useState(false)
  const [stanCount, setStanCount] = useState(initialStanCount)
  const [isPending, startTransition] = useTransition()


  // Fetch initial state
  useEffect(() => {
    async function loadStanStatus() {
      try {
        const res = await fetch(`/api/stan?artistId=${artistId}`)
        const data = await res.json()
        if (res.ok) {
          setIsStan(data.userHasStanned)
          setStanCount(data.stanCount)
        }
      } catch (e) {
        console.error("Failed to fetch stan status:", e)
      }
    }
    startTransition(() => loadStanStatus())
  }, [artistId])

  // Join artist-specific room
  useEffect(() => {
    if (!socket) return
    socket.emit("join", `artist:${artistId}`)

    const handleUpdate = (payload: any) => {
      if (payload.artistId === artistId) {
        setStanCount(payload.stanCount)
      }
    }

    socket.on("stan:update", handleUpdate)

    return () => {
      socket.emit("leave", `artist:${artistId}`)
      socket.off("stan:update", handleUpdate)
    }
  }, [artistId, socket])

  // Handle follow/unfollow
  const handleToggle = async () => {
    startTransition(async () => {
      const nextState = !isStan
      setIsStan(nextState)
      setStanCount((prev) => prev + (nextState ? 1 : -1)) // optimistic update

      try {
        const res = await fetch(`/api/stan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            artistId,
            action: nextState ? "stan" : "unstan",
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || "Failed to update")

        setStanCount(data.stanCount)
        toast.success(data.message || "Success ✅")
      } catch (err: any) {
        console.error(err)
        setIsStan(!nextState)
        setStanCount((prev) => prev - (nextState ? 1 : -1))
        toast.error(err.message || "Something went wrong ❌")
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="stan-button"
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "transition-all duration-300 focus:outline-none",
          isPending && "opacity-70 cursor-not-allowed"
        )}
      >
        <Badge
          className={cn(
            "capitalize rounded-full px-3 py-1 text-xs font-medium select-none cursor-pointer",
            isStan
              ? "from-gray-700 to-gray-900 bg-gradient-to-r text-gray-100"
              : "from-pink-600 to-orange-400 bg-gradient-to-r text-white shadow-sm hover:shadow-md"
          )}
        >
          {isPending ? "Processing..." : isStan ? "Stanned 👋" : "Stan 🔥"}
        </Badge>
      </button>

      <span className="text-xs text-muted-foreground">
        {stanCount} {stanCount === 1 ? "stan" : "stans"}
      </span>
    </div>
  )
}
