"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Play, Sparkles, RefreshCw, DollarSign, Send } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type CampaignCreateDTO = {
  artistId: string;
  mediaType: "song" | "album" | "video";
  mediaId: string;
  campaignName: string;
  budget: number;
  dailyCap?: number;
  status?: string;
  targeting?: { countries?: string[]; genres?: string[]; platforms?: string[] };
  schedule?: {
    startDate?: string;
    endDate?: string;
    timezone?: string;
    autoBoost?: boolean;
    autoStop?: boolean;
    recurring?: "none" | "daily" | "weekly" | "monthly";
  };
  ai?: { adCopy?: string };
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MarketingStudioPage() {
  const { data: campaignsResp, mutate } = useSWR("/api/campaigns", fetcher);
  const campaigns = campaignsResp?.campaigns || [];

  const [form, setForm] = useState<Partial<CampaignCreateDTO>>({
    artistId: "demo-artist",
    mediaType: "song",
    mediaId: "demo-media",
    campaignName: "",
    budget: 100,
    dailyCap: 20,
    targeting: { countries: ["ZM"], genres: ["Afrobeat"], platforms: ["app"] },
    schedule: { startDate: new Date().toISOString(), autoBoost: true, autoStop: true, recurring: "none" },
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState<string>("26097");
  const [mmProvider, setMmProvider] = useState<string>("MTN");
  const [generating, setGenerating] = useState(false);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [recurring, setRecurring] = useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [aiCopy, setAICopy] = useState<string>("");

  async function createCampaign(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!form.campaignName) return toast.error("Campaign name required");

    const body = {
      ...form,
      schedule: {
        ...form.schedule,
        startDate: scheduleDate.toISOString(),
        recurring,
        autoBoost: true,
        autoStop: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    toast.success("Campaign created");
    mutate();
    setOpenModal(false);
  }

  async function topUpWallet() {
    await fetch("/api/wallet/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: walletAmount }),
    });
    toast.success("Wallet topped up");
  }

  async function payWithMM(campaignId?: string) {
    await fetch("/api/mobile-money/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: mmProvider, phone: mobileMoneyPhone, amount: 50, campaignId }),
    });
    toast.success("Mobile money payment simulated");
  }

  async function generateAICopy(campaignId?: string) {
    setGenerating(true);
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: `Write short ad copy for campaign ${form.campaignName || campaignId}` }),
    });
    const json = await res.json();
    setGenerating(false);

    if (json?.copy) {
      setAICopy(json.copy);
      toast.success("AI copy generated");
    } else toast.error("AI failed");
  }

  async function runOptimize() {
    await fetch("/api/optimize", { method: "POST" });
    toast.success("Optimizer run");
    mutate();
  }

  return (
    <div className="p-6 max-w-8xl mx-auto space-y-8 bg-white dark:bg-neutral-900 text-black dark:text-white">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Campaign Studio</h1>
          <p className="text-sm text-muted-foreground dark:text-gray-400">Create, fund, schedule and optimize ad campaigns from one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={runOptimize} variant="ghost" size="sm" className="dark:text-white">
            <Sparkles className="mr-2" /> Run Optimizer
          </Button>
          <Button onClick={() => mutate()} className="dark:text-white">
            <RefreshCw />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Wallet + Schedule */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 bg-white dark:bg-neutral-800">
            <Button size="sm" className="dark:bg-blue-600 dark:hover:bg-blue-700" onClick={() => setOpenModal(true)}>
              <Plus className="mr-2" /> Schedule Post
            </Button>
            {aiCopy && <div className="mt-2 p-2 bg-gray-100 dark:bg-neutral-700 rounded">{aiCopy}</div>}
          </Card>

          <Card className="p-4 bg-white dark:bg-neutral-800">
            <h3 className="font-semibold">Wallet / Payments</h3>
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <Input type="number" value={walletAmount} onChange={(e) => setWalletAmount(Number(e.target.value))} className="dark:bg-neutral-700 dark:text-white" placeholder="Amount" />
                <Button onClick={topUpWallet} className="dark:bg-green-600 dark:hover:bg-green-700"><DollarSign /></Button>
              </div>

              <div className="text-xs text-muted-foreground dark:text-gray-400">Mobile Money</div>
              <div className="flex gap-2 items-center">
                <Select value={mmProvider} onValueChange={setMmProvider}>
                  <SelectTrigger className="dark:bg-neutral-700 dark:text-white">
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTN">MTN</SelectItem>
                    <SelectItem value="Airtel">Airtel</SelectItem>
                    <SelectItem value="Zamtel">Zamtel</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={mobileMoneyPhone} onChange={(e) => setMobileMoneyPhone(e.target.value)} className="dark:bg-neutral-700 dark:text-white" />
                <Button onClick={() => payWithMM(selected || undefined)} className="dark:bg-blue-600 dark:hover:bg-blue-700"><Send /></Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle: Campaigns */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 bg-white dark:bg-neutral-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Active Campaigns</h3>
              <span className="text-sm text-muted-foreground dark:text-gray-400">{campaigns.length}</span>
            </div>
            <div className="mt-4 space-y-3">
              {campaigns.map((c: any) => (
                <motion.div key={c._id} layout className={`p-3 rounded border ${selected === c._id ? "border-black dark:border-white" : "border-gray-100 dark:border-gray-700"}`} onClick={() => setSelected(c._id)}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-semibold">{c.campaignName}</div>
                      <div className="text-xs text-muted-foreground dark:text-gray-400">Budget: ${c.budget}</div>
                      <div className="text-xs text-muted-foreground dark:text-gray-400">Platforms: {(c.targeting?.platforms || []).join(", ")}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{c.performance?.impressions ?? 0}</div>
                      <div className="text-xs text-muted-foreground dark:text-gray-400">imps</div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => generateAICopy(c._id)} className="dark:text-white"><Sparkles /></Button>
                    <Button size="sm" onClick={() => fetch(`/api/campaigns/${c._id}`, { method: "PATCH", body: JSON.stringify({ status: c.status === "running" ? "paused" : "running" }) }).then(() => mutate())} className="dark:text-white"><Play /></Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Analytics */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 bg-white dark:bg-neutral-800">
            <h3 className="font-semibold">Quick Analytics</h3>
            <div className="mt-3 text-sm text-muted-foreground dark:text-gray-400">Summary for selected campaign</div>
            {selected ? (() => {
              const c = campaigns.find((x:any) => x._id === selected);
              if (!c) return <div className="text-sm text-muted-foreground dark:text-gray-400">Pick a campaign</div>;
              return (
                <div className="mt-3">
                  <div className="text-sm">Impressions <strong>{c.performance?.impressions ?? 0}</strong></div>
                  <div className="text-sm">Clicks <strong>{c.performance?.clicks ?? 0}</strong></div>
                  <div className="text-sm">CTR <strong>{((c.performance?.clicks||0)/(Math.max(1,c.performance?.impressions||1))*100).toFixed(2)}%</strong></div>
                  <div className="mt-3">
                    <Button size="sm" onClick={() => fetch("/api/optimize", { method: "POST" }).then(() => toast("Optimizer run"))} className="dark:bg-blue-600 dark:hover:bg-blue-700">Run Optimizer</Button>
                  </div>
                </div>
              );
            })() : <div className="text-sm text-muted-foreground dark:text-gray-400 mt-3">Select a campaign to view analytics.</div>}
          </Card>
        </div>
      </div>

      {/* Schedule Modal */}
      <Dialog.Root open={openModal} onOpenChange={setOpenModal}>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-96 max-w-full p-6 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-800 rounded-md shadow-lg space-y-4">
          <Dialog.Title className="font-bold text-lg">Schedule Campaign</Dialog.Title>
          <div className="flex flex-col space-y-2">
            <label className="text-xs uppercase">Campaign Name</label>
            <Input value={form.campaignName || ""} onChange={(e) => setForm({ ...form, campaignName: e.target.value })} className="dark:bg-neutral-700 dark:text-white" />

            <label className="text-xs uppercase">Schedule Date & Time</label>
            <DatePicker
              selected={scheduleDate}
              onChange={(date: Date | null) => date && setScheduleDate(date)}
              showTimeSelect
              dateFormat="Pp"
              className="w-full p-2 border rounded dark:bg-neutral-700 dark:text-white"
            />

            <label className="text-xs uppercase">Recurring</label>
            <Select value={recurring} onValueChange={(v) => setRecurring(v as any)}>
              <SelectTrigger className="dark:bg-neutral-700 dark:text-white">
                <SelectValue placeholder="Recurring" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>

            <label className="text-xs uppercase">Platforms</label>
            <Select value={form.targeting?.platforms?.[0] || "app"} onValueChange={(v) => setForm({ ...form, targeting: { ...(form.targeting || {}), platforms: [v] } })}>
              <SelectTrigger className="dark:bg-neutral-700 dark:text-white">
                <SelectValue placeholder="Select Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="app">App</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>

            <Button size="sm" className="dark:bg-blue-600 dark:hover:bg-blue-700" onClick={() => generateAICopy()}>
              <Sparkles className="mr-2" /> Generate AI Copy
            </Button>
            {aiCopy && <div className="p-2 bg-gray-100 dark:bg-neutral-700 rounded">{aiCopy}</div>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpenModal(false)}>Cancel</Button>
              <Button size="sm" className="dark:bg-green-600 dark:hover:bg-green-700" onClick={createCampaign}>Schedule</Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
