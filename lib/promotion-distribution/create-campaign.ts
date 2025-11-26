"use server";

import { connectToDatabase } from "../database";
import { Campaign } from "../database/models/campaign";


export async function createCampaign(data: any) {
  await connectToDatabase();

  const newCampaign = await Campaign.create({
    ...data,
    status: "draft",
  });

  return JSON.parse(JSON.stringify(newCampaign));
}
