import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user";

export async function GET() {
  await connectToDatabase();

  const stans = await User.aggregate([
    { $unwind: "$stan" },
    { $group: { _id: "$stan", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  
  return Response.json({ stans });
}