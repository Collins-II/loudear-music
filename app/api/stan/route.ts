import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/database"
import User from "@/lib/database/models/user"
import { getCurrentUser } from "@/actions/getCurrentUser"

const jsonResponse = (data: any, status = 200) =>
  NextResponse.json(data, { status })

// ===========================================================
// 🔥 POST /api/stan → Follow (stan) / Unfollow (unstan)
// ===========================================================
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const session = await getCurrentUser()
    if (!session?.email)
      return jsonResponse({ error: "Unauthorized" }, 401)

    const { artistId, action } = await req.json()

    if (!artistId || !["stan", "unstan"].includes(action))
      return jsonResponse({ error: "Invalid request" }, 400)

    if (!mongoose.Types.ObjectId.isValid(artistId))
      return jsonResponse({ error: "Invalid artist ID" }, 400)

    const fanUser = await User.findOne({ email: session.email })
    if (!fanUser) return jsonResponse({ error: "User not found" }, 404)

    // ✅ Prevent self-follow (compare ObjectIds properly)
    if (fanUser._id === artistId )
      return jsonResponse({ error: "You cannot follow yourself" }, 400)

    // ✅ Atomic MongoDB update
    const updateOp =
      action === "stan"
        ? { $addToSet: { stan: new mongoose.Types.ObjectId(artistId) } }
        : { $pull: { stan: new mongoose.Types.ObjectId(artistId) } }

    await User.updateOne({ _id: fanUser._id }, updateOp)

    // ✅ Count total followers
    const stanCount = await User.countDocuments({ stan: artistId })
    const userHasStanned = action === "stan"

    // ✅ Emit Socket.IO update
    const io = (globalThis as any).io
    if (io) {
      io.to(`artist:${artistId}`).emit("stan:update", {
        artistId,
        stanCount,
        userHasStanned,
      })
    }

    return jsonResponse({
      success: true,
      message:
        action === "stan"
          ? "You are now following this artist 🔥"
          : "You unfollowed this artist 👋",
      stanCount,
      userHasStanned,
    })
  } catch (error: any) {
    console.error("Stan API error:", error)
    if (error.name === "MongoNetworkError")
      return jsonResponse({ error: "Database connection failed" }, 503)

    return jsonResponse({ error: "Internal Server Error" }, 500)
  }
}

// ===========================================================
// 🧠 GET /api/stan?artistId=xxx → Fetch stan stats for artist
// ===========================================================
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    const session = await getCurrentUser()
    const { searchParams } = new URL(req.url)
    const artistId = searchParams.get("artistId")

    if (!artistId)
      return jsonResponse({ error: "Missing artistId" }, 400)

    if (!mongoose.Types.ObjectId.isValid(artistId))
      return jsonResponse({ error: "Invalid artist ID" }, 400)

    const stanCount = await User.countDocuments({ stan: artistId })
    let userHasStanned = false

    if (session?.email) {
      const fanUser = await User.findOne({ email: session.email })
      if (fanUser) {
        userHasStanned = fanUser.stan?.some(
          (id) => id.toString() === artistId.toString()
        ) as boolean;
      }
    }

    return jsonResponse({
      success: true,
      artistId,
      stanCount,
      userHasStanned,
    })
  } catch (error) {
    console.error("Stan GET API error:", error)
    return jsonResponse({ error: "Internal Server Error" }, 500)
  }
}
