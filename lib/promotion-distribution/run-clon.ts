import { optimizeCampaign } from "@/lib/ai/optimizer";
import { Campaign } from "../database/models/campaign";


export async function runCron() {
  const running = await Campaign.find({ status: "running" });

  for (const c of running) {
    await optimizeCampaign(c._id.toString());
  }
}
