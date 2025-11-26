"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Download, Upload, CreditCard, WatchIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, timeAgo } from "@/lib/utils";

/* ----------------------
   Types
   ---------------------- */
type Transaction = {
  id: string;
  type: "deposit" | "withdrawal" | "payout" | "sale" | "adjustment";
  amount: number; // cents or minor unit
  currency: string;
  createdAt: string;
  status: "pending" | "completed" | "failed";
  meta?: Record<string, any>;
};

type WalletSummary = {
  balance: number; // minor unit (cents)
  pending: number;
  payoutsPending: number;
  totalEarned: number;
};

/* ----------------------
   Dummy / initial data
   ---------------------- */
const MOCK_TX: Transaction[] = [
  { id: "t_1", type: "sale", amount: 5000, currency: "USD", createdAt: new Date().toISOString(), status: "completed", meta: { source: "Stream royalty" } },
  { id: "t_2", type: "payout", amount: -1500, currency: "USD", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: "completed", meta: { method: "Stripe" } },
  { id: "t_3", type: "deposit", amount: 2000, currency: "USD", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), status: "pending", meta: { method: "MobileMoney (MTN)" } },
];

/* ----------------------
   Helpers: pretend API
   ---------------------- */
async function fetchWallet(): Promise<{ summary: WalletSummary; tx: Transaction[] }> {
  // Replace with real fetch to /api/wallet
  await new Promise((r) => setTimeout(r, 300));
  const summary: WalletSummary = { balance: 12000, pending: 2000, payoutsPending: 1500, totalEarned: 42000 };
  return { summary, tx: MOCK_TX };
}

async function requestPayout(payload: { method: string; amount: number; destination: string }) {
  // POST to /api/wallet/payout
  await new Promise((r) => setTimeout(r, 800));
  return { ok: true, id: "payout_123" };
}

/* ----------------------
   Component
   ---------------------- */
export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [tx, setTx] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState("stripe");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [destination, setDestination] = useState<string>(""); // phone or bank details

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await fetchWallet();
      if (!mounted) return;
      setSummary(res.summary);
      setTx(res.tx);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const visibleTx = useMemo(() => {
    if (filter === "all") return tx;
    return tx.filter((t) => t.type === filter);
  }, [tx, filter]);

  const balanceDisplay = summary ? formatCurrency(summary.balance / 100, "USD") : "--";

  const handleRequestPayout = async () => {
    if (!summary) return;
    const amountNum = Math.round(Number(withdrawAmount) * 100);
    if (!amountNum || amountNum <= 0) return alert("Enter a valid amount");
    if (amountNum > summary.balance) return alert("Insufficient balance");

    const payload = { method: withdrawMethod, amount: amountNum, destination };
    // optimistic UI: add pending transaction
    const tmp: Transaction = {
      id: `tmp_${Date.now()}`,
      type: "payout",
      amount: -amountNum,
      currency: "USD",
      createdAt: new Date().toISOString(),
      status: "pending",
      meta: { method: withdrawMethod },
    };
    setTx((prev) => [tmp, ...prev]);
    setSummary({ ...summary, balance: summary.balance - amountNum, payoutsPending: summary.payoutsPending + amountNum });

    try {
      const r = await requestPayout(payload);
      if (!r.ok) throw new Error("Payout failed");
      // update pending -> completed (in real app you'd wait webhook)
      setTx((prev) => prev.map((t) => (t.id === tmp.id ? { ...t, id: r.id, status: "completed" } : t)));
    } catch (err) {
      console.error(err);
      setTx((prev) => prev.map((t) => (t.id === tmp.id ? { ...t, status: "failed" } : t)));
      // refund balance
      setSummary((s) => s ? { ...s, balance: s.balance + amountNum, payoutsPending: Math.max(0, s.payoutsPending - amountNum) } : s);
      alert("Payout request failed.");
    } finally {
      setOpenWithdraw(false);
      setWithdrawAmount("");
      setDestination("");
    }
  };

  const exportLedger = () => {
    // CSV export example
    const rows = [
      ["id", "type", "amount", "currency", "status", "date", "meta"],
      ...tx.map((t) => [t.id, t.type, (t.amount / 100).toFixed(2), t.currency, t.status, t.createdAt, JSON.stringify(t.meta || {})]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallet-ledger-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen py-10">
      <div className="max-w-6xl mx-auto space-y-8 px-4">
        <motion.div initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Wallet</h1>
            <p className="text-sm text-muted-foreground">Manage earnings, payouts and transaction history.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={exportLedger} title="Export ledger"><Download className="mr-2" /> Export CSV</Button>
            <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
              <DialogTrigger asChild>
                <Button><CreditCard className="mr-2" /> Withdraw</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <h3 className="text-lg font-bold mb-3">Request Payout</h3>
                <div className="grid grid-cols-1 gap-3">
                  <Select onValueChange={(v) => setWithdrawMethod(v)}>
                    <SelectTrigger>{withdrawMethod.toUpperCase()}</SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Bank (Stripe)</SelectItem>
                      <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                      <SelectItem value="airtel">Airtel Money</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Destination (phone number / bank id / paypal email)" value={destination} onChange={(e) => setDestination(e.target.value)} />
                  <Input placeholder="Amount (USD)" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                  <div className="flex gap-2 justify-end mt-2">
                    <Button variant="ghost" onClick={() => setOpenWithdraw(false)}>Cancel</Button>
                    <Button onClick={handleRequestPayout}>Confirm Payout</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign /> <span>Total balance</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{balanceDisplay}</div>
              <div className="text-sm text-muted-foreground">Pending: {summary ? formatCurrency(summary.pending / 100, "USD") : "--"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <WatchIcon /> <span>Pending payouts</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">{summary ? formatCurrency(summary.payoutsPending / 100, "USD") : "--"}</div>
              <div className="text-sm text-muted-foreground">You have pending payouts awaiting approval</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Upload /> <span>Total earned</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">{summary ? formatCurrency(summary.totalEarned / 100, "USD") : "--"}</div>
              <div className="text-sm text-muted-foreground">All-time</div>
            </CardContent>
          </Card>
        </div>

        {/* TRANSACTIONS */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold">Transactions</h3>
              <div className="text-sm text-muted-foreground">Recent activity</div>
            </div>

            <div className="flex items-center gap-2">
              <Select onValueChange={(v) => setFilter(v)}>
                <SelectTrigger>{filter}</SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="payout">Payouts</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                {visibleTx.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.id}</TableCell>
                    <TableCell className="capitalize">{t.type}</TableCell>
                    <TableCell>{formatCurrency(t.amount / 100, t.currency)}</TableCell>
                    <TableCell><Badge variant={t.status === "completed" ? "default" : t.status === "pending" ? "secondary" : "destructive"}>{t.status}</Badge></TableCell>
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
