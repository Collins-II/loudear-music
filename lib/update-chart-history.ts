import { connectToDatabase } from "@/lib/database";
import { ChartHistory, IChartHistory } from "@/lib/database/models/chartHistory";
import { Song } from "@/lib/database/models/song";
import { Album } from "@/lib/database/models/album";
import { Video } from "@/lib/database/models/video";
import dayjs from "dayjs";

/**
 * Updates weekly chart history for songs, albums, or videos.
 * Supports region-based analytics updates (Zambia, Nigeria, Global).
 */
export async function updateChartHistory(
  category: "songs" | "albums" | "videos",
  region: "Zambia" | "Nigeria" | "Global" = "Global" // pass region dynamically from analytics
) {
  await connectToDatabase();

  const currentWeek = `${dayjs().year()}-W${String(dayjs().isoWeek()).padStart(2, "0")}`;
  const prevWeek = `${dayjs().subtract(1, "week").year()}-W${String(
    dayjs().subtract(1, "week").isoWeek()
  ).padStart(2, "0")}`;

  const Model =
    category === "songs" ? Song : category === "albums" ? Album : Video;

  // Fetch items with interaction data
  const items = await Model.find()
    .select("_id views likes downloads shares")
    .lean();

  // Compute "chart score" (adjustable formula)
  const scored = items
    .map((i) => ({
      itemId: i._id,
      score:
        (i.views?.length ?? 0) +
        (i.likes?.length ?? 0) * 2 +
        (i.shares?.length ?? 0) * 3 +
        (i.downloads?.length ?? 0) * 1.5,
    }))
    .sort((a, b) => b.score - a.score);

  // 🟩 Fetch last week's chart for this category & region
  const prevChart = await ChartHistory.findOne<IChartHistory>({
    category,
    region,
    week: prevWeek,
  }).lean();

  // 🟩 Fallback to empty items if no previous chart
  const prevItems = Array.isArray(prevChart?.items) ? prevChart.items : [];

  // 🟩 Compute rank, peak, weeksOn
  const itemsForChart = scored.map((entry, index) => {
    const prevItem = prevItems.find(
      (i) => String(i.itemId) === String(entry.itemId)
    );

    const peak = prevItem ? Math.min(prevItem.peak, index + 1) : index + 1;
    const weeksOn = prevItem ? prevItem.weeksOn + 1 : 1;

    return {
      ...entry,
      rank: index + 1,
      peak,
      weeksOn,
    };
  });

  // 🟩 Upsert the chart document (category + region + week)
  await ChartHistory.findOneAndUpdate(
    { category, region, week: currentWeek },
    { category, region, week: currentWeek, items: itemsForChart },
    { upsert: true, new: true }
  );

  console.log(
    `✅ Updated ${category} chart for ${region} (${currentWeek}) with ${itemsForChart.length} items`
  );
}
