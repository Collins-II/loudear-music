// app/wallet/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Download, CreditCard, Upload, Wallet, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, timeAgo } from "@/lib/utils";

/* -------------------------
   Types
-------------------------- */
type WalletData = {
  balance: number;
  locked: number;
  pendingPayout: number;
  currency: string;
};

type Tx = {
  _id: string;
  type: string;
  amount: number;
  currency: string;
  createdAt: string;
  status: string;
};

type RecentData = {
  transactions: Tx[];
};

type AnalyticsData = {
  last30DaysIncome: number;
  lifetimeEarnings: number;
};

/* -------------------------
   API Helpers
-------------------------- */
async function apiFetchWallet() {
  const res = await fetch("/api/wallet", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch wallet");
  return res.json();
}

async function apiRequestPayout(payload: any) {
  const res = await fetch("/api/wallet/payout", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}

/* -------------------------
   Skeleton Loader Components
-------------------------- */
function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="h-6 bg-muted animate-pulse rounded-md mb-2" />
      <CardContent className="h-12 bg-muted animate-pulse rounded-md" />
    </Card>
  );
}

function SkeletonTableRow() {
  return (
    <TableRow>
      {[...Array(5)].map((_, idx) => (
        <TableCell key={idx} className="h-6 bg-muted animate-pulse rounded-md" />
      ))}
    </TableRow>
  );
}

/* -------------------------
   Wallet Page Component
-------------------------- */
export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [recent, setRecent] = useState<RecentData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [filter, setFilter] = useState("all");

  /* Withdraw modal state */
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState("mtn");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");

  const loadWallet = async () => {
    setLoading(true);
    try {
      const data = await apiFetchWallet();
      setWallet(data.wallet);
      setRecent({ transactions: data.recent.transactions });
      setAnalytics(data.analytics);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const visibleTx = useMemo(() => {
    if (!recent) return [];
    if (filter === "all") return recent.transactions;
    return recent.transactions.filter((t) => t.type === filter);
  }, [recent, filter]);

  const balanceDisplay = wallet ? formatCurrency(wallet.balance / 100, wallet.currency) : "--";

  const handleRequestPayout = async () => {
    if (!wallet) return;
    const amountNum = Math.round(Number(amount) * 100);
    if (amountNum <= 0) return alert("Invalid amount");
    if (amountNum > wallet.balance) return alert("Insufficient balance");

    const payload = {
      method: withdrawMethod,
      provider: withdrawMethod.toUpperCase(),
      amount: amountNum,
      destination,
    };

    setOpenWithdraw(false);

    // Optimistic transaction
    const optimisticTx: Tx = {
      _id: "tmp_" + Date.now(),
      type: "payout",
      amount: -amountNum,
      currency: wallet.currency,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    setRecent((r) =>
      r ? { ...r, transactions: [optimisticTx, ...r.transactions] } : r
    );
    setWallet((w) =>
      w ? { ...w, balance: w.balance - amountNum, pendingPayout: w.pendingPayout + amountNum } : w
    );

    try {
      const result = await apiRequestPayout(payload);
      if (!result.success) throw new Error(result.error || "Failed payout");

      setTimeout(loadWallet, 1500);
    } catch (err) {
      console.error(err);
      alert("Payout failed");
      loadWallet();
    }
  };

  const exportCSV = () => {
    if (!recent) return;
    const rows = [
      ["ID", "Type", "Amount", "Currency", "Status", "Date"],
      ...recent.transactions.map((t) => [
        t._id,
        t.type,
        (t.amount / 100).toFixed(2),
        t.currency,
        t.status,
        t.createdAt,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallet_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen py-10 bg-background text-foreground transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-extrabold">Wallet</h1>
            <p className="text-sm text-muted-foreground">Your money, payouts & analytics.</p>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={exportCSV} disabled={loading}>
              <Download className="mr-2" /> Export CSV
            </Button>

            <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
              <DialogTrigger asChild>
                <Button disabled={loading}>
                  <CreditCard className="mr-2" /> Withdraw
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-lg">
                <h3 className="text-lg font-bold mb-3">Request Withdrawal</h3>

                <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                  <SelectTrigger>{withdrawMethod.toUpperCase()}</SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mtn">MTN</SelectItem>
                    <SelectItem value="airtel">Airtel</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Phone / Account / Email"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="mt-3"
                />

                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-3"
                />

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="ghost" onClick={() => setOpenWithdraw(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRequestPayout}>Confirm</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {loading
            ? [...Array(4)].map((_, idx) => <SkeletonCard key={idx} />)
            : wallet && analytics && (
                <>
                  <Card>
                    <CardHeader className="flex items-center gap-2">
                      <Wallet /> Balance
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">{balanceDisplay}</CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex items-center gap-2">
                      <Upload /> Pending Payouts
                    </CardHeader>
                    <CardContent>
                      {formatCurrency(wallet.pendingPayout / 100, wallet.currency)}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex items-center gap-2">
                      <DollarSign /> Last 30 Days
                    </CardHeader>
                    <CardContent>
                      {formatCurrency(analytics.last30DaysIncome / 100, wallet.currency)}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex items-center gap-2">
                      <PieChart /> Lifetime Earnings
                    </CardHeader>
                    <CardContent>
                      {formatCurrency(analytics.lifetimeEarnings / 100, wallet.currency)}
                    </CardContent>
                  </Card>
                </>
              )}
        </div>

        {/* TRANSACTIONS */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Transactions</h3>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">{filter}</SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="payout">Payout</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHeader>

              <tbody>
                {loading
                  ? [...Array(5)].map((_, idx) => <SkeletonTableRow key={idx} />)
                  : visibleTx?.map((t) => (
                      <TableRow key={t._id}>
                        <TableCell>{t._id}</TableCell>
                        <TableCell>{t.type}</TableCell>
                        <TableCell>{formatCurrency(t.amount / 100, t.currency)}</TableCell>
                        <TableCell>
                          <Badge variant={t.status === "success" ? "default" : "secondary"}>
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{timeAgo(t.createdAt)}</TableCell>
                      </TableRow>
                    ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
