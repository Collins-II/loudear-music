"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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
import { TrendingUp, Wallet, Phone, CreditCard, History } from "lucide-react";

// ------------------------------
// Dummy Data
// ------------------------------
const earnings = [
  { month: "Jan", amount: 143 },
  { month: "Feb", amount: 212 },
  { month: "Mar", amount: 289 },
  { month: "Apr", amount: 310 },
  { month: "May", amount: 450 },
];

const payoutHistory = [
  { id: 1, method: "Mobile Money", amount: 150, date: "2024-11-01", status: "Paid" },
  { id: 2, method: "Stripe", amount: 200, date: "2024-10-10", status: "Paid" },
  { id: 3, method: "PayPal", amount: 120, date: "2024-09-21", status: "Pending" },
];

// ------------------------------
// Page Component
// ------------------------------

export default function MonetizationPage() {
  const [autoPayout, setAutoPayout] = useState(false);

  return (
    <div className="min-h-screen w-full py-12 px-4 md:px-10 
      bg-gradient-to-b from-background via-background/40 to-background">

      {/* ------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Monetization</h1>
          <p className="text-muted-foreground mt-1">
            Track your revenue, payouts, and payment methods.
          </p>
        </div>
        <Badge className="text-sm" variant="outline">
          Artist Account
        </Badge>
      </motion.div>

      {/* ------------------------------------------------ */}
      {/* Earnings Overview */}
      {/* ------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="shadow-sm">
          <CardHeader className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium">Total Earnings</span>
            <Wallet className="h-4 w-4 opacity-60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$1,524</div>
            <p className="text-sm text-muted-foreground">All-time</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium">Last Month</span>
            <TrendingUp className="h-4 w-4 opacity-60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$450</div>
            <p className="text-sm text-muted-foreground">+12% from previous</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium">Pending Payouts</span>
            <History className="h-4 w-4 opacity-60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$120</div>
            <p className="text-sm text-muted-foreground">Awaiting clearance</p>
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------ */}
      {/* Tabs Section */}
      {/* ------------------------------------------------ */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="payouts">Payout Settings</TabsTrigger>
          <TabsTrigger value="history">Earnings History</TabsTrigger>
        </TabsList>

        {/* ---------------- Payment Methods ---------------- */}
        <TabsContent value="payments">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mobile Money */}
            <Card className="border-muted-foreground/20 p-5">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="h-6 w-6" />
                <h2 className="text-xl font-semibold">Mobile Money</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                Accept payments from MTN, Airtel, and Zamtel users.
              </p>

              <Select>
                <SelectTrigger className="mb-3">
                  Choose Provider
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                  <SelectItem value="airtel">Airtel Money</SelectItem>
                  <SelectItem value="zamtel">Zamtel Money</SelectItem>
                </SelectContent>
              </Select>

              <Input placeholder="Mobile Money Number" className="mb-4" />
              <Button className="w-full">Link Mobile Money</Button>
            </Card>

            {/* Stripe */}
            <Card className="border-muted-foreground/20 p-5">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-6 w-6" />
                <h2 className="text-xl font-semibold">Stripe</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                Receive payouts to your bank account.
              </p>
              <Button className="w-full">Connect Stripe</Button>
            </Card>

            {/* PayPal */}
            <Card className="border-muted-foreground/20 p-5">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-6 w-6" />
                <h2 className="text-xl font-semibold">PayPal</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                Connect your PayPal email for instant payouts.
              </p>

              <Input placeholder="PayPal Email" className="mb-4" />
              <Button className="w-full">Connect PayPal</Button>
            </Card>
          </div>
        </TabsContent>

        {/* ---------------- Payout Settings ---------------- */}
        <TabsContent value="payouts">
          <Card className="p-6 max-w-xl">
            <h2 className="text-2xl font-bold mb-4">Payout Options</h2>

            <div className="flex items-center justify-between mb-4">
              <span>Enable Automatic Payouts</span>
              <Switch checked={autoPayout} onCheckedChange={setAutoPayout} />
            </div>

            {autoPayout && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border rounded-xl p-4 bg-muted/20"
              >
                <p className="text-sm text-muted-foreground mb-2">
                  Payout Frequency
                </p>
                <Select>
                  <SelectTrigger>Choose</SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </Card>
        </TabsContent>

        {/* ---------------- Earnings History ---------------- */}
        <TabsContent value="history">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Payout History</h2>

            <Separator className="mb-4" />

            <div className="space-y-4">
              {payoutHistory.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-medium">{p.method}</p>
                    <p className="text-muted-foreground text-sm">{p.date}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">${p.amount}</p>
                    <Badge
                      variant={p.status === "Paid" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
