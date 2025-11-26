"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, UserPlus, Download } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ----------------------
   Types
   ---------------------- */
type Split = {
  id: string;
  name: string;
  role?: string;
  percent: number; // 0-100
  destination?: string; // email/phone for payout
  verified?: boolean;
};

type TrackSplit = {
  trackId: string;
  title: string;
  splits: Split[];
};

/* ----------------------
   Dummy Data
   ---------------------- */
const demoTracks: TrackSplit[] = [
  {
    trackId: "trk_1",
    title: "Sunset Vibes",
    splits: [
      { id: "a", name: "You (Producer)", percent: 70, destination: "you@artist.com", verified: true },
      { id: "b", name: "Feat. Amy", percent: 30, destination: "amy@example.com" },
    ],
  },
  {
    trackId: "trk_2",
    title: "City Lights",
    splits: [
      { id: "a", name: "You (Producer)", percent: 50, destination: "you@artist.com", verified: true },
      { id: "c", name: "Co-producer", percent: 50, destination: "co@music.com" },
    ],
  },
];

/* ----------------------
   Utilities
   ---------------------- */
const sumPerc = (splits: Split[]) => splits.reduce((s, p) => s + (p.percent || 0), 0);

/* ----------------------
   Component
   ---------------------- */
export default function RoyaltySplitsPage() {
  const [tracks, setTracks] = useState<TrackSplit[]>(demoTracks);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(tracks[0].trackId);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [newSplitName, setNewSplitName] = useState("");
  const [newSplitPct, setNewSplitPct] = useState<number | "">("");

  const curr = tracks.find((t) => t.trackId === selectedTrack) || tracks[0];

  const onAddSplit = () => {
    if (!curr) return;
    if (!newSplitName || !newSplitPct) return alert("Enter name and %");
    const pct = Number(newSplitPct);
    if (pct <= 0 || pct > 100) return alert("Enter a valid percent");
    const existingTotal = sumPerc(curr.splits);
    if (existingTotal + pct > 100) return alert("Total exceeds 100%");

    const updated = tracks.map((t) =>
      t.trackId === curr.trackId ? { ...t, splits: [...t.splits, { id: `s_${Date.now()}`, name: newSplitName, percent: pct }] } : t
    );
    setTracks(updated);
    setNewSplitName("");
    setNewSplitPct("");
  };

  const onRemoveSplit = (splitId: string) => {
    const updated = tracks.map((t) => (t.trackId === curr.trackId ? { ...t, splits: t.splits.filter((s) => s.id !== splitId) } : t));
    setTracks(updated);
  };

  const onUpdatePercent = (splitId: string, percent: number) => {
    const updated = tracks.map((t) =>
      t.trackId === curr.trackId ? { ...t, splits: t.splits.map((s) => (s.id === splitId ? { ...s, percent } : s)) } : t
    );
    // validate not exceeding 100
    const newCurr = updated.find((x) => x.trackId === curr.trackId);
    if (newCurr && sumPerc(newCurr.splits) > 100) return alert("Total exceeds 100%");
    setTracks(updated);
  };

  const exportSplits = () => {
    const payload = tracks.map((t) => ({ trackId: t.trackId, title: t.title, splits: t.splits }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "royalty-splits.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <motion.header initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Royalty Splits</h1>
            <p className="text-sm text-muted-foreground">Set how streaming/purchase revenue is split between collaborators.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={exportSplits}><Download className="mr-2" /> Export</Button>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button><UserPlus className="mr-2" /> Invite collaborator</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <h3 className="font-bold text-lg mb-2">Invite collaborator</h3>
                <p className="text-sm text-muted-foreground mb-3">Send an email invite to accept split and payout information (this is a placeholder UI — implement server mailing).</p>
                <Input placeholder="Collaborator name" className="mb-2" />
                <Input placeholder="Collaborator email" className="mb-2" />
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
                  <Button onClick={() => { alert("Invite sent (demo)"); setInviteOpen(false); }}>Send Invite</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tracks list */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-bold">Your Tracks</h3>
              <Badge>{tracks.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tracks.map((t) => (
                  <button key={t.trackId} onClick={() => setSelectedTrack(t.trackId)} className={`w-full text-left p-2 rounded ${t.trackId === selectedTrack ? "bg-black/5 dark:bg-white/5" : "hover:bg-black/2 dark:hover:bg-white/5"}`}>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{sumPerc(t.splits)}% allocated</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected track splits */}
          <Card className="md:col-span-2">
            <CardHeader className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{curr.title}</h3>
                <div className="text-sm text-muted-foreground">{sumPerc(curr.splits)}% allocated</div>
              </div>

              <div className="flex items-center gap-2">
                <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => {}}>
                    <PlusCircle className="mr-2" /> Add split
                  </Button>
                </DialogTrigger>
                </Dialog>
                <Button onClick={exportSplits} variant="ghost">Export</Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Percent</TableCell>
                      <TableCell>Destination</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {curr.splits.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>
                          <input
                            aria-label="input-number"
                            type="number"
                            min={0}
                            max={100}
                            value={s.percent}
                            onChange={(e) => onUpdatePercent(s.id, Number(e.target.value))}
                            className="w-20 p-1 border rounded text-sm"
                          />
                          %
                        </TableCell>
                        <TableCell>{s.destination ?? "—"}</TableCell>
                        <TableCell>{s.verified ? <Badge>Verified</Badge> : <Badge variant="secondary">Unverified</Badge>}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => onRemoveSplit(s.id)}>Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>

                {/* Quick add */}
                <div className="flex gap-2 items-center mt-4">
                  <Input placeholder="Collaborator name" value={newSplitName} onChange={(e) => setNewSplitName(e.target.value)} />
                  <Input placeholder="Percent" type="number" className="w-28" value={newSplitPct as any} onChange={(e) => setNewSplitPct(Number(e.target.value))} />
                  <Button onClick={onAddSplit}><PlusCircle /></Button>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground">
                  <strong>Notes:</strong> Total split percent must equal 100% before settlement. Invite collaborators so they can provide payout details.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
