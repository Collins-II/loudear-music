"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Wallet,
  Phone,
  CreditCard,
  History,
  Loader2,
  Link2,
  RefreshCw,
} from "lucide-react";
import { IUser } from "@/lib/database/models/user";

/* -------------------------
   Types
--------------------------*/

type MobileMoneyInfo = {
  provider?: "MTN" | "Airtel" | "Zamtel" | "Other";
  phoneNumber?: string;
  verified?: boolean;
};

type PaymentInfo = {
  stripeAccountId?: string;
  paypalEmail?: string;
  mobileMoney?: MobileMoneyInfo;
  payoutEnabled?: boolean;
};

type WalletStats = {
  balance: number;
  currency: string;
  last30DaysIncome: number;
  lifetimeEarnings: number;
  pendingPayout: number;
};

type PayoutRecord = {
  _id: string;
  method: string;
  amount: number;
  currency: string;
  createdAt: string;
  status: "success" | "pending" | "failed";
};

/* -------------------------
   Simple UI helpers
--------------------------*/

function formatCurrency(amountCents: number | undefined, currency = "ZMW") {
  if (amountCents == null) return `0.00 ${currency}`;
  const value = amountCents / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function isValidPhoneNumber(phone: string) {
  const cleaned = phone.replace(/[^\d]/g, "");
  return cleaned.length >= 9 && cleaned.length <= 15;
}

function calculateNextPayout(balance: number, frequency: string, time: string) {
  const now = new Date();
  const next = new Date();

  const [hours, minutes] = time.split(":").map(Number);
  next.setHours(hours, minutes, 0, 0);

  if (frequency === "daily") {
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (frequency === "weekly") {
    const dayOfWeek = next.getDay();
    const today = now.getDay();
    const diff = (7 + dayOfWeek - today) % 7 || 7;
    next.setDate(next.getDate() + diff);
    if (next <= now) next.setDate(next.getDate() + 7);
  } else if (frequency === "monthly") {
    next.setMonth(next.getMonth() + (next <= now ? 1 : 0));
  }

  return { date: next, display: `${next.toLocaleDateString()} at ${next.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, amount: balance };
}

/* -------------------------
   API wrappers (small, central)
   Replace route paths if yours differ
--------------------------*/

async function apiFetchJSON(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json?.error || "Request failed");
    (err as any).meta = json;
    throw err;
  }
  return json;
}

async function fetchWallet(page = 1, pageSize = 20) {
  // If you support pagination server-side, pass query params
  return apiFetchJSON(`/api/wallet?page=${page}&pageSize=${pageSize}`, { method: "GET", cache: "no-store" });
}

async function fetchPaymentInfo() {
  return apiFetchJSON(`/api/payments/methods`, { method: "GET", cache: "no-store" });
}

async function saveMobileMoney(payload: Partial<MobileMoneyInfo & { payoutEnabled?: boolean }>) {
  return apiFetchJSON(`/api/payments/mobile-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function connectStripe() {
  return apiFetchJSON(`/api/payment/stripe/connect`, { method: "POST" });
}
/* -------------------------
   Component
--------------------------*/

export default function MonetizationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<IUser>();
  const [wallet, setWallet] = useState<WalletStats | null>(null);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);

  const [mobileProvider, setMobileProvider] = useState<MobileMoneyInfo["provider"] | "">("");
  const [mobileNumber, setMobileNumber] = useState("");
const [autoPayout, setAutoPayout] = useState(false);
const [payoutFrequency, setPayoutFrequency] = useState<string>("monthly");
const [payoutTime, setPayoutTime] = useState<string>("01:00"); // default 1 AM



  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /* -------------------------
     Load wallet + payment info (page 1 for history)
  --------------------------*/
  const loadAll = useCallback(
    async (opts?: { page?: number }) => {
      setError(null);
      setRefreshing(true);
      const page = opts?.page ?? 1;
      try {
        const [walletRes, paymentRes] = await Promise.all([fetchWallet(page), fetchPaymentInfo()]);
        // Defensive reading - backend may return different shape
        const w = walletRes.wallet ?? {};
        const analytics = walletRes.analytics ?? {};
        setWallet({
          balance: w.balance ?? 0,
          currency: w.currency ?? "ZMW",
          last30DaysIncome: analytics.last30DaysIncome ?? 0,
          lifetimeEarnings: analytics.lifetimeEarnings ?? 0,
          pendingPayout: w.pendingPayout ?? 0,
        });
        setUser(walletRes.user)

        const payouts: PayoutRecord[] = (walletRes.recent?.payouts ?? []).map((p: any) => ({
          _id: p._id,
          method: p.method || p.provider || "Mobile Money",
          amount: p.amount,
          currency: p.currency || (w.currency ?? "ZMW"),
          createdAt: p.createdAt,
          status: p.status,
        }));

        if (page === 1) {
          setPayoutHistory(payouts);
        } else {
          setPayoutHistory((prev) => [...prev, ...payouts]);
        }

        // Basic heuristic for pagination - depends on server
        setHasMoreHistory(payouts.length >= 20);

        const pay = paymentRes.payment ?? {};
        setPayment(pay);
        setAutoPayout(Boolean(pay?.payoutEnabled));
        if (pay?.mobileMoney) {
          setMobileProvider(pay.mobileMoney.provider || "");
          setMobileNumber(pay.mobileMoney.phoneNumber || "");
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load monetization data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAll({ page: 1 });
  }, [loadAll]);

  /* -------------------------
     Save Mobile Money
  --------------------------*/

  const handleSaveMobileMoney = useCallback(async () => {
    setError(null);
    setSuccess(null);

    if (!mobileProvider) {
      setError("Please select a provider.");
      return;
    }
    if (!isValidPhoneNumber(mobileNumber)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSaving(true);
    try {
      const res = await saveMobileMoney({ provider: mobileProvider, phoneNumber: mobileNumber });
      if (!res.success) throw new Error(res.error || "Failed to save mobile money");
      setSuccess("Mobile money saved successfully.");
      // refresh data
      await loadAll({ page: 1 });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to connect mobile money");
    } finally {
      setSaving(false);
      // auto-clear small UI messages
      setTimeout(() => setSuccess(null), 4500);
    }
  }, [mobileProvider, mobileNumber, loadAll]);

  /* -------------------------
     Connect Stripe
  --------------------------*/

  const handleStripeConnect = useCallback(async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await connectStripe();
      if (res?.url) {
        // redirect to Stripe Connect
        window.location.href = res.url;
      } else {
        throw new Error("Unable to reach Stripe at the moment.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to start Stripe onboarding.");
    } finally {
      setSaving(false);
    }
  }, []);

  /* -------------------------
     Toggle auto-payout (optimistic)
  --------------------------*/

const savePayoutSettings = async (updates: Partial<{ autoPayout: boolean; payoutFrequency: string; payoutTime: string }>) => {
  const payload: any = {};
  if (typeof updates.autoPayout === "boolean") payload.autoPayout = updates.autoPayout;
  if (updates.payoutFrequency) payload.payoutFrequency = updates.payoutFrequency;
  if (updates.payoutTime) payload.payoutTime = updates.payoutTime;

  if (Object.keys(payload).length === 0) return; // skip API call if nothing to update

  setSaving(true);
  try {
    const res = await fetch("/api/payments/payout-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to save payout settings");
  } catch (err: any) {
    console.error(err);
    alert(err?.message || "Failed to save payout settings");
  } finally {
    setSaving(false);
  }
};
  /* -------------------------
     Load more history
  --------------------------*/

  const loadMoreHistory = useCallback(async () => {
    const nextPage = historyPage + 1;
    setHistoryPage(nextPage);
    await loadAll({ page: nextPage });
  }, [historyPage, loadAll]);

  /* -------------------------
     Derived values
  --------------------------*/


   /*--------------------------*/
  const balanceDisplay = useMemo(() => formatCurrency(wallet?.balance, wallet?.currency), [wallet]);
  const lifetimeDisplay = useMemo(() => formatCurrency(wallet?.lifetimeEarnings, wallet?.currency), [wallet]);
  const last30Display = useMemo(() => formatCurrency(wallet?.last30DaysIncome, wallet?.currency), [wallet]);
  const pendingDisplay = useMemo(() => formatCurrency(wallet?.pendingPayout, wallet?.currency), [wallet]);
  const nextPayout = useMemo(() => calculateNextPayout(wallet?.balance ?? 0, payoutFrequency, payoutTime), [wallet, payoutFrequency, payoutTime]);

  /* -------------------------
     Render
  --------------------------*/

  if (loading) {
    return (
      <div className="p-10 flex flex-col gap-8" role="status" aria-live="polite">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted/30" />
          ))}
        </div>
        <div className="h-20 bg-muted/40 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full py-12 px-4 md:px-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Monetization</h1>
          <p className="text-muted-foreground mt-1">Track your earnings, payouts, and connected payment methods.</p>
        </div>
      </motion.div>

      {/* Alerts */}
      <div className="space-y-2 mb-6">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 p-3 rounded" role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-700 bg-green-50 p-3 rounded" role="status">
            {success}
          </div>
        )}
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="text-sm">Total Earnings</span>
            <Wallet className="h-5 w-5 opacity-70" />
          </CardHeader>
          <CardContent className="text-3xl font-bold">{lifetimeDisplay}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="text-sm">Last 30 Days</span>
            <TrendingUp className="h-5 w-5 opacity-70" />
          </CardHeader>
          <CardContent className="text-3xl font-bold">{last30Display}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="text-sm">Pending Payouts</span>
            <History className="h-5 w-5 opacity-70" />
          </CardHeader>
          <CardContent className="text-3xl font-bold">{pendingDisplay}</CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="payments">
        <TabsList className="mb-6">
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="payouts">Payout Settings</TabsTrigger>
          <TabsTrigger value="history">Earnings History</TabsTrigger>
        </TabsList>

        {/* Payments */}
        <TabsContent value="payments">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mobile Money */}
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="h-6 w-6" />
                <h2 className="text-xl font-semibold">Mobile Money</h2>
              </div>

              <label className="sr-only" htmlFor="mm-provider">Mobile money provider</label>
              <Select value={mobileProvider} onValueChange={(v: any) => setMobileProvider(v)}>
                <SelectTrigger id="mm-provider" aria-label="Mobile money provider" className="mb-3">
                  {mobileProvider || "Select provider"}
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="MTN">MTN</SelectItem>
                  <SelectItem value="Airtel">Airtel</SelectItem>
                  <SelectItem value="Zamtel">Zamtel</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Input
                aria-label="Mobile number"
                placeholder="Mobile Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="mb-3"
                inputMode="tel"
              />

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={handleSaveMobileMoney}
                  disabled={saving || !mobileProvider || !isValidPhoneNumber(mobileNumber)}
                >
                  {saving ? <Loader2 className="animate-spin" /> : <Link2 className="mr-2" />}
                  {payment?.mobileMoney?.phoneNumber ? "Update" : "Connect"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileProvider("");
                    setMobileNumber("");
                    setSuccess(null);
                    setError(null);
                  }}
                  aria-label="Reset mobile money form"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-3">
                Connected mobile number:{" "}
                <strong>{user?.payment?.mobileMoney?.phoneNumber ?? "—"}</strong>
                {user?.payment?.mobileMoney?.verified ? " (verified)" : user?.payment?.mobileMoney?.phoneNumber ? " (unverified)" : ""}
              </p>
            </Card>

            {/* Stripe */}
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-6 w-6" />
                <h2 className="text-xl font-semibold">Stripe</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Use Stripe Connect to receive payouts directly to your bank account (international).
              </p>

              {payment?.stripeAccountId ? (
                <Button className="w-full" variant="outline" aria-label="Stripe connected">
                  Connected ✓
                </Button>
              ) : (
                <Button className="w-full" onClick={handleStripeConnect} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" /> : <Link2 className="mr-2" />}
                  Connect Stripe
                </Button>
              )}
            </Card>

            {/* Quick summary / actions */}
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="h-6 w-6" />
                <h2 className="text-xl font-semibold">Quick actions</h2>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="font-medium">{balanceDisplay}</p>
                  </div>
                  <Button onClick={() => loadAll({ page: 1 })} variant="ghost" aria-label="Refresh data" disabled={refreshing}>
                    {refreshing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                  </Button>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground">Payout schedule</p>
                  <p className="text-sm">Monthly on the 1st (configurable)</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Payout Settings */}
   {/* Payout Settings */}
        <TabsContent value="payouts">
          <Card className="p-6 max-w-2xl space-y-6">
            <h2 className="text-2xl font-bold mb-4">Payout Options</h2>

            {/* Automatic Payout */}
            <div className="flex items-center justify-between mb-4">
              <span>Enable Automatic Payouts</span>
              <Switch
                checked={autoPayout}
                onCheckedChange={async (v: any) => {
                  const enabled = Boolean(v);
                  setAutoPayout(enabled);
                  await savePayoutSettings({ autoPayout: enabled });
                }}
                aria-label="Toggle automatic payouts"
              />
            </div>

            {/* Schedule */}
            {autoPayout && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                  <label htmlFor="payout-frequency" className="text-sm font-medium w-40">Payout Frequency</label>
                  <Select value={payoutFrequency} onValueChange={async (v: string) => { setPayoutFrequency(v); await savePayoutSettings({ payoutFrequency: v }); }}>
                    <SelectTrigger>{payoutFrequency || "Select frequency"}</SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                  <label htmlFor="payout-time" className="text-sm font-medium w-40">Payout Time</label>
                  <Input type="time" id="payout-time" value={payoutTime} onChange={async (e) => { setPayoutTime(e.target.value); await savePayoutSettings({ payoutTime: e.target.value }); }} className="w-full md:w-auto" />
                </div>

                {/* Next Payout Preview */}
                <Card className="bg-muted p-4 mt-2">
                  <p className="text-sm text-muted-foreground">Next Scheduled Payout</p>
                  <p className="font-medium text-lg">{formatCurrency(nextPayout.amount, wallet?.currency)} on {nextPayout.display}</p>
                </Card>

                <p className="text-sm text-muted-foreground">
                  The selected time determines when automatic payouts will be executed according to the chosen frequency.
                </p>
              </div>
            )}

            <Separator />
            <div className="mt-4 text-sm text-muted-foreground space-y-2">
              <p>Note: For mobile money payouts, a small transfer fee may apply. For Stripe bank payouts, follow Stripe onboarding instructions.</p>
              <p>Ensure a verified payout method is connected before enabling automatic payouts.</p>
            </div>
          </Card>
        </TabsContent>



        {/* Payout History */}
        <TabsContent value="history">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Payout History</h2>
              <div className="text-sm text-muted-foreground">{payoutHistory.length} records</div>
            </div>

            <Separator className="mb-4" />

            <div className="space-y-4">
              {payoutHistory.length === 0 && <p className="text-muted-foreground">No payout history yet.</p>}

              {payoutHistory.map((p) => (
                <div key={p._id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{p.method}</p>
                    <p className="text-muted-foreground text-sm">{new Date(p.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(p.amount, p.currency)}</p>
                    <Badge variant={p.status === "success" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              {hasMoreHistory ? (
                <Button onClick={loadMoreHistory} variant="ghost" aria-label="Load more history">
                  Load more
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">No more history</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
