import { Campaign } from "../database/models/campaign";

export async function optimizeCampaign(campaignId: string) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) return;

  const { impressions, clicks, /*cost*/ } = campaign.performance;

  const ctr = clicks / Math.max(impressions, 1);
  //const cpc = cost / Math.max(clicks, 1);

  // underperforming → auto pause
  if (campaign.schedule?.autoStop && ctr < 0.004) {
    campaign.status = "paused";
    await campaign.save();
    return;
  }

  // over-performing → auto-boost
  if (campaign.schedule?.autoBoost && ctr > 0.08) {
    campaign.budget += campaign.budget * 0.20; // +20% boost
    await campaign.save();
  }
}
