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
import { Plus, Play, Sparkles, RefreshCw, DollarSign, Send, Loader2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";
import { useSession } from "next-auth/react";

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CampaignStudioPage() {
  const { data: session } = useSession();
  const user = session?.user;

  // Fetch campaigns, media, wallet
  const { data: campaignsResp, mutate: mutateCampaigns } = useSWR("/api/campaign", fetcher);
  const { data: mediaResp } = useSWR("/api/media?limit=100", fetcher);
  const { data: walletResp, mutate: mutateWallet } = useSWR("/api/wallet", fetcher);
  console.log("WALLET_BALANCE", walletResp)

  const campaigns = campaignsResp?.campaigns || [];
  const media = mediaResp?.media || [];
  const walletBalance = walletResp?.wallet.balance || 0;

  const [topUpAmount, setTopUpAmount] = useState<number>(0);

  const [form, setForm] = useState<Partial<CampaignCreateDTO>>({
    mediaType: "song",
    mediaId: "",
    campaignName: "",
    budget: 100,
    dailyCap: 20,
    targeting: { countries: ["ZM"], genres: ["Afrobeat"], platforms: ["app"] },
    schedule: { startDate: new Date().toISOString(), autoBoost: true, autoStop: true, recurring: "none" },
  });

  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState<string>("26097");
  const [mmProvider, setMmProvider] = useState<string>("MTN");
  const [generating, setGenerating] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [recurring, setRecurring] = useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [aiCopy, setAICopy] = useState<string>("");

  // --- Helper Functions ---
  const safeFetch = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      return json;
    } catch (err: any) {
      toast.error(err.message || "Network error");
      throw err;
    }
  };

  // --- Campaign Operations ---
  const createCampaign = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user?.id) return toast.error("Please login");
    if (!form.campaignName || !form.mediaId || !form.budget) return toast.error("Complete all campaign fields");
    if (form.budget! > walletBalance) return toast.error("Budget exceeds wallet balance");

    const body = {
      ...form,
      artistId: user.id,
      schedule: { ...form.schedule, startDate: scheduleDate.toISOString(), recurring, autoBoost: true, autoStop: true, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    };

    try {
      await safeFetch("/api/campaign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      toast.success("Campaign created");
      mutateCampaigns();
      mutateWallet();
      setOpenModal(false);
      setForm({ ...form, campaignName: "", mediaId: "" });
      setAICopy("");
    } catch {}
  };

  const topUpWallet = async () => {
    if (topUpAmount <= 0) return toast.error("Enter a valid amount");
    try {
      await safeFetch("/api/wallet/topup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: topUpAmount }) });
      toast.success("Wallet topped up");
      setTopUpAmount(0);
      mutateWallet();
    } catch {}
  };

  const payWithMM = async (campaignId?: string) => {
    if (!mobileMoneyPhone) return toast.error("Enter phone number");
    try {
      await safeFetch("/api/mobile-money/test-pay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider: mmProvider, phone: mobileMoneyPhone, amount: 50, campaignId }) });
      toast.success("Mobile money payment completed");
      mutateWallet();
    } catch {}
  };

  const generateAICopy = async (campaignId?: string) => {
    setGenerating(true);
    try {
      const json = await safeFetch("/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: `Write short ad copy for campaign ${form.campaignName || campaignId}` }) });
      if (json?.copy) {
        setAICopy(json.copy);
        toast.success("AI copy generated");
      } else toast.error("AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const runOptimizer = async () => {
    try {
      await safeFetch("/api/optimize", { method: "POST" });
      toast.success("Optimizer run");
      mutateCampaigns();
    } catch {}
  };

  return (
    <div className="p-6 max-w-8xl mx-auto space-y-8 bg-white dark:bg-neutral-900 text-black dark:text-white">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Campaign Studio</h1>
          <p className="text-sm text-muted-foreground dark:text-gray-400">Create, fund, schedule and optimize ad campaigns.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={runOptimizer} variant="ghost" size="sm" className="dark:text-white"><Sparkles className="mr-2" /> Run Optimizer</Button>
          <Button onClick={() => mutateCampaigns()} className="dark:text-white"><RefreshCw /></Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Wallet & Schedule */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 bg-white dark:bg-neutral-800 space-y-3">
            <Button size="sm" className="dark:bg-blue-600 dark:hover:bg-blue-700" onClick={() => setOpenModal(true)}><Plus className="mr-2" /> Schedule Campaign</Button>
            {aiCopy && <div className="p-2 bg-gray-100 dark:bg-neutral-700 rounded">{aiCopy}</div>}
          </Card>

          <Card className="p-4 bg-white dark:bg-neutral-800 space-y-1">
            <h3 className="font-semibold">Wallet / Mobile Money</h3>
            <div className="text-1xl font-extrabold text-muted-foreground dark:text-gray-400 mb-1">Balance: ${walletBalance}</div>
            <div className="flex gap-2">
              <Input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(Number(e.target.value))} className="dark:bg-neutral-700 dark:text-white" placeholder="Amount" />
              <Button onClick={topUpWallet} className="dark:bg-green-600 dark:hover:bg-green-700"><DollarSign /></Button>
            </div>
            <div className="flex gap-2 items-center">
              <Select value={mmProvider} onValueChange={setMmProvider}>
                <SelectTrigger className="dark:bg-neutral-700 dark:text-white"><SelectValue placeholder="Provider" /></SelectTrigger>
                <SelectContent>{["MTN","Airtel","Zamtel"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <Input value={mobileMoneyPhone} onChange={(e) => setMobileMoneyPhone(e.target.value)} className="dark:bg-neutral-700 dark:text-white" />
              <Button onClick={() => payWithMM(selectedCampaign || undefined)} className="dark:bg-blue-600 dark:hover:bg-blue-700"><Send /></Button>
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
            <div className="mt-4 space-y-3 max-h-[600px] overflow-y-auto">
              {campaigns.map((c:any) => {
                const mediaItem = media.find((m:any) => m._id === c.mediaId);
                return (
                  <motion.div key={c._id} layout className={`p-3 rounded border ${selectedCampaign === c._id ? "border-black dark:border-white" : "border-gray-100 dark:border-gray-700"}`} onClick={() => setSelectedCampaign(c._id)}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="font-semibold">{c.campaignName}</div>
                        <div className="text-xs text-muted-foreground dark:text-gray-400">Budget: ${c.budget}</div>
                        <div className="text-xs text-muted-foreground dark:text-gray-400">Platforms: {(c.targeting?.platforms || []).join(", ")}</div>
                        {mediaItem && mediaItem.type === "video" ? (
                          <video src={mediaItem.videoUrl || mediaItem.url} controls className="w-full rounded mt-2" />
                        ) : mediaItem ? (
                          <Image src={mediaItem.thumbnailUrl || mediaItem.url} alt={mediaItem.title} width={300} height={170} className="rounded mt-2" />
                        ) : null}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{c.performance?.impressions ?? 0}</div>
                        <div className="text-xs text-muted-foreground dark:text-gray-400">imps</div>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => generateAICopy(c._id)} className="dark:text-white">
                        <Sparkles /> {generating ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                      </Button>
                      <Button size="sm" onClick={() => fetch(`/api/campaign/${c._id}`, { method: "PATCH", body: JSON.stringify({ status: c.status === "running" ? "paused" : "running" }) }).then(() => mutateCampaigns())} className="dark:text-white">
                        <Play />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Analytics */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 bg-white dark:bg-neutral-800">
            <h3 className="font-semibold">Quick Analytics & Suggestions</h3>
            {selectedCampaign ? (() => {
              const c = campaigns.find((x:any) => x._id === selectedCampaign);
              if (!c) return <div className="text-sm text-muted-foreground dark:text-gray-400">Pick a campaign</div>;
              return (
                <div className="mt-3 space-y-2">
                  <div className="text-sm">Impressions: <strong>{c.performance?.impressions ?? 0}</strong></div>
                  <div className="text-sm">Clicks: <strong>{c.performance?.clicks ?? 0}</strong></div>
                  <div className="text-sm">CTR: <strong>{((c.performance?.clicks||0)/(Math.max(1,c.performance?.impressions||1))*100).toFixed(2)}%</strong></div>
                  {c.budget < 50 && <div className="text-xs text-red-500">Low budget warning</div>}
                  <Button size="sm" onClick={runOptimizer} className="dark:bg-blue-600 dark:hover:bg-blue-700">Run Optimizer</Button>
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

            <label className="text-xs uppercase">Media</label>
            <Select value={form.mediaId || ""} onValueChange={(v) => setForm({ ...form, mediaId: v })}>
              <SelectTrigger className="dark:bg-neutral-700 dark:text-white"><SelectValue placeholder="Select Media" /></SelectTrigger>
              <SelectContent>{media.map((m:any) => <SelectItem key={m._id} value={m._id}>{m.title} ({m.type})</SelectItem>)}</SelectContent>
            </Select>

            <label className="text-xs uppercase">Campaign Budget ($)</label>
            <Input type="number" value={form.budget || 0} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} className="dark:bg-neutral-700 dark:text-white" />
            {form.budget! > walletBalance && <div className="text-xs text-red-500">Budget exceeds wallet balance!</div>}

            <label className="text-xs uppercase">Daily Cap ($)</label>
            <Input type="number" value={form.dailyCap || 0} onChange={(e) => setForm({ ...form, dailyCap: Number(e.target.value) })} className="dark:bg-neutral-700 dark:text-white" />

            <label className="text-xs uppercase">Schedule Date & Time</label>
            <DatePicker selected={scheduleDate} onChange={(date) => date && setScheduleDate(date)} showTimeSelect dateFormat="Pp" className="w-full p-2 border rounded dark:bg-neutral-700 dark:text-white" />

            <label className="text-xs uppercase">Recurring</label>
            <Select value={recurring} onValueChange={(v) => setRecurring(v as any)}>
              <SelectTrigger className="dark:bg-neutral-700 dark:text-white"><SelectValue placeholder="Recurring" /></SelectTrigger>
              <SelectContent>{["none","daily","weekly","monthly"].map(r => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</SelectItem>)}</SelectContent>
            </Select>

            <label className="text-xs uppercase">Platforms</label>
            <Select value={form.targeting?.platforms?.[0] || "app"} onValueChange={(v) => setForm({ ...form, targeting: { ...(form.targeting || {}), platforms: [v] } })}>
              <SelectTrigger className="dark:bg-neutral-700 dark:text-white"><SelectValue placeholder="Select Platform" /></SelectTrigger>
              <SelectContent>{["app","tiktok","instagram","youtube"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
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
