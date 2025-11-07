"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rocket, Save } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface Campaign {
  id: number;
  title: string;
  platform: string;
  budget: number;
  duration: string;
  description: string;
  reach: number;
  clicks: number;
  conversions: number;
  conversionRate?: number; // %
  cpc?: number; // Cost per conversion
}

const COLORS = ["#facc15", "#fb923c", "#ef4444", "#3b82f6", "#22c55e"];

export default function PromotionsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState<Omit<Campaign, "id">>({
    title: "",
    platform: "",
    budget: 0,
    duration: "",
    description: "",
    reach: 0,
    clicks: 0,
    conversions: 0,
  });

  // Load saved campaigns OR dummy data
  useEffect(() => {
    const saved = sessionStorage.getItem("promotionsData");
    if (saved) {
      setCampaigns(JSON.parse(saved));
    } else {
      // Dummy campaigns
      const dummy: Campaign[] = [
        {
          id: 1,
          title: "TikTok Dance Challenge",
          platform: "TikTok",
          budget: 1500,
          duration: "2 Weeks",
          description: "Dance challenge to promote new single.",
          reach: 50000,
          clicks: 12000,
          conversions: 1800,
        },
        {
          id: 2,
          title: "Instagram Story Ads",
          platform: "Instagram",
          budget: 1000,
          duration: "1 Month",
          description: "Targeted story ads for brand awareness.",
          reach: 40000,
          clicks: 8000,
          conversions: 950,
        },
        {
          id: 3,
          title: "YouTube Pre-Roll Campaign",
          platform: "YouTube",
          budget: 2000,
          duration: "3 Weeks",
          description: "Pre-roll video ads before trending content.",
          reach: 70000,
          clicks: 15000,
          conversions: 2200,
        },
      ].map((c) => ({
        ...c,
        conversionRate: ((c.conversions / c.clicks) * 100).toFixed(2) as any,
        cpc: c.conversions > 0 ? (c.budget / c.conversions).toFixed(2) as any : 0,
      }));

      setCampaigns(dummy);
      sessionStorage.setItem("promotionsData", JSON.stringify(dummy));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "budget" || name === "reach" || name === "clicks" || name === "conversions"
          ? Number(value)
          : value,
    }));
  };

  const handleAddCampaign = () => {
    if (!form.title || !form.platform) return;

    const conversionRate =
      form.clicks > 0 ? (form.conversions / form.clicks) * 100 : 0;
    const cpc =
      form.conversions > 0 ? form.budget / form.conversions : 0;

    const newCampaign: Campaign = {
      id: Date.now(),
      ...form,
      conversionRate,
      cpc,
    };

    const updated = [...campaigns, newCampaign];
    setCampaigns(updated);
    setForm({
      title: "",
      platform: "",
      budget: 0,
      duration: "",
      description: "",
      reach: 0,
      clicks: 0,
      conversions: 0,
    });
    sessionStorage.setItem("promotionsData", JSON.stringify(updated));
  };

  const handleSaveAll = () => {
    sessionStorage.setItem("promotionsData", JSON.stringify(campaigns));
    alert("Promotions & Marketing campaigns saved successfully!");
  };

  // Prepare analytics data
  const budgetData = campaigns.map((c) => ({
    platform: c.platform,
    budget: c.budget,
  }));

  const performanceData = campaigns.map((c) => ({
    name: c.title,
    reach: c.reach,
    clicks: c.clicks,
    conversions: c.conversions,
  }));

  const platformData = campaigns.reduce((acc: any[], c) => {
    const existing = acc.find((d) => d.name === c.platform);
    if (existing) existing.value += 1;
    else acc.push({ name: c.platform, value: 1 });
    return acc;
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-extrabold text-center mb-12"
        >
          Promotions & Marketing
        </motion.h1>

        {/* Campaign Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 space-y-6 mb-12">
          <div>
            <Label className="text-white">Campaign Title</Label>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. New Single Launch"
              className="bg-white/80 text-black rounded-xl"
            />
          </div>

          <div>
            <Label className="text-white">Platform</Label>
            <Select
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, platform: value }))
              }
              value={form.platform}
            >
              <SelectTrigger className="bg-white/80 text-black rounded-xl">
                <SelectValue placeholder="Choose a platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Spotify">Spotify</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-white">Budget (K)</Label>
              <Input
                name="budget"
                type="number"
                value={form.budget}
                onChange={handleChange}
                placeholder="Enter budget amount"
                className="bg-white/80 text-black rounded-xl"
              />
            </div>

            <div>
              <Label className="text-white">Duration</Label>
              <Input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 2 Weeks"
                className="bg-white/80 text-black rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Description</Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the campaign goals..."
              className="bg-white/80 text-black rounded-xl"
            />
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-white">Reach</Label>
              <Input
                name="reach"
                type="number"
                value={form.reach}
                onChange={handleChange}
                placeholder="e.g. 50000"
                className="bg-white/80 text-black rounded-xl"
              />
            </div>
            <div>
              <Label className="text-white">Clicks</Label>
              <Input
                name="clicks"
                type="number"
                value={form.clicks}
                onChange={handleChange}
                placeholder="e.g. 12000"
                className="bg-white/80 text-black rounded-xl"
              />
            </div>
            <div>
              <Label className="text-white">Conversions</Label>
              <Input
                name="conversions"
                type="number"
                value={form.conversions}
                onChange={handleChange}
                placeholder="e.g. 1500"
                className="bg-white/80 text-black rounded-xl"
              />
            </div>
          </div>

          <Button
            onClick={handleAddCampaign}
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
          >
            <Rocket className="w-5 h-5" /> Launch Campaign
          </Button>
        </div>

        {/* Campaign List */}
        <div className="grid gap-6">
          {campaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20"
            >
              <h3 className="text-2xl font-bold text-white">
                {campaign.title}
              </h3>
              <p className="text-sm text-white/70">📌 {campaign.platform}</p>
              <p className="text-sm text-white/70">💰 K{campaign.budget}</p>
              <p className="text-sm text-white/70">⏳ {campaign.duration}</p>
              <p className="mt-3 text-white/90">{campaign.description}</p>
              <p className="mt-2 text-sm text-green-400">
                Reach: {campaign.reach.toLocaleString()} | Clicks:{" "}
                {campaign.clicks.toLocaleString()} | Conversions:{" "}
                {campaign.conversions.toLocaleString()}
              </p>
              <p className="text-sm text-yellow-400">
                Conversion Rate: {campaign.conversionRate || 0}% | CPC: K
                {campaign.cpc || 0}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Save All Button */}
        {campaigns.length > 0 && (
          <div className="mt-10 flex justify-center">
            <Button
              onClick={handleSaveAll}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg"
            >
              <Save className="w-5 h-5" /> Save All Campaigns
            </Button>
          </div>
        )}

        {/* Analytics Dashboard */}
        {campaigns.length > 0 && (
          <div className="mt-16 space-y-12">
            <h2 className="text-3xl font-bold text-center">
              📊 Campaign Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Budget by Platform */}
              <div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Budget Allocation
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetData}>
                    <XAxis dataKey="platform" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip />
                    <Bar dataKey="budget" fill="#fb923c" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Campaign Distribution */}
              <div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Campaigns by Platform
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={120}
                      label
                    >
                      {platformData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">
                Engagement Performance (Reach, Clicks, Conversions)
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceData}>
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="reach" stroke="#facc15" />
                  <Line type="monotone" dataKey="clicks" stroke="#3b82f6" />
                  <Line type="monotone" dataKey="conversions" stroke="#22c55e" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
