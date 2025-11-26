// scripts/cron-optimize.ts
import { connectToDatabase } from "@/lib/database";
import fetch from "node-fetch";

async function run() {
  await connectToDatabase();
  // call the endpoint (or import the optimizer directly)
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/optimize`, { method: "POST", body: JSON.stringify({}) });
  console.log(await res.json());
}

run().catch(console.error);
