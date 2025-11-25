"use client";

import { useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

/**
 * Props
 * - followers: number
 * - basePrice: number (minimum default price)
 * - onPriceChange: (value: number) => void
 */

type AutoPricingProps = {
  followers: number;
  basePrice?: number;
  onPriceChange?: (value: number) => void;
};

/** Artist Badge Logic
 * Bronze: 0 - 5,000 followers
 * Silver: 5,001 - 50,000 followers
 * Gold: 50,001+ followers
 */

const getArtistBadge = (followers: number) => {
  if (followers > 50000) return "Gold";
  if (followers > 5000) return "Silver";
  return "Bronze";
};

/** Pricing Range Logic
 * Bronze: $5 - $25
 * Silver: $25 - $75
 * Gold: $75 - $200
 */

const getPricingRange = (badge: string) => {
  switch (badge) {
    case "Gold":
      return { min: 75, max: 200 };
    case "Silver":
      return { min: 25, max: 75 };
    case "Bronze":
    default:
      return { min: 5, max: 25 };
  }
};

export default function AutoPricing({ followers, basePrice = 0, onPriceChange }: AutoPricingProps) {
  const badge = useMemo(() => getArtistBadge(followers), [followers]);
  const range = useMemo(() => getPricingRange(badge), [badge]);

  const initialPrice = Math.max(basePrice, range.min);

  return (
    <div className="py-4 px-2 rounded-2xl shadow-sm w-full max-w-md">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Automatic Pricing</h2>
          <Badge variant="outline">{badge} Artist</Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Followers: <strong>{followers.toLocaleString()}</strong>
        </p>

        <div className="space-y-2">
          <Label>Price Range</Label>
          <p className="text-sm">k{range.min} - k{range.max}</p>
        </div>

        <div className="space-y-2">
          <Label>Set Your Price</Label>
          <Slider
            defaultValue={[initialPrice]}
            min={range.min}
            max={range.max}
            step={1}
            onValueChange={(val) => onPriceChange?.(val[0])}
          />
        </div>
      </div>
    </div>
  );
}
