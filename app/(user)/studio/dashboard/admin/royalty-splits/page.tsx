// File: /app/(user)/studio/dashboard/royalties/page.tsx
"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { PlusCircle, UserPlus, Download, Sparkles } from "lucide-react";
import { jsPDF } from "jspdf";                      // ← NEW

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ---------------------------------------------------------------------------
// AI Auto-Split Suggestion Engine
// ---------------------------------------------------------------------------
function computeAiSplitSuggestions(track: any) {
  if (!track) return [];

  const collabs: any[] = [];
  if (track.artist) collabs.push({ name: track.artist, weight: 1.0 });
  if (Array.isArray(track.features))
    track.features.forEach((f: string) =>
      collabs.push({ name: f, weight: 0.5 })
    );

  if (track.genre === "Hip-Hop") collabs.forEach((c) => (c.weight += 0.2));
  if (track.mood === "emotional") collabs.forEach((c) => (c.weight += 0.1));

  const totalWeight = collabs.reduce((s, c) => s + c.weight, 0);
  return collabs.map((c) => ({
    collaboratorName: c.name,
    percent: Number(((c.weight / totalWeight) * 100).toFixed(1)),
  }));
}

// ---------------------------------------------------------------------------

export default function RoyaltiesPage() {
  const { data: tracksRes, mutate: mutateTracks } = useSWR(
    "/api/royalties/tracks",
    fetcher
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [splits, setSplits] = useState<any[]>([]);
  const [loadingSplits, setLoadingSplits] = useState(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPct, setNewPct] = useState<number | "">("");

  // Prefill first track
  useEffect(() => {
    if (tracksRes?.songs?.length) setSelected(tracksRes.songs[0]._id);
  }, [tracksRes]);

  const loadSplits = useCallback(async (songId: string | null) => {
    if (!songId) return;
    setLoadingSplits(true);
    const res = await fetch(`/api/royalties/splits/${songId}`);
    const json = await res.json();
    setSplits(json.splits || []);
    setLoadingSplits(false);
  }, []);

  useEffect(() => {
    if (selected) loadSplits(selected);
  }, [selected, loadSplits]);

  const sum = (arr: any[]) =>
    arr.reduce((s, x) => s + (Number(x.percent) || 0), 0);

  // ---------------------------------------------------------------------------
  // PDF EXPORT — Replaces old JSON export
  // ---------------------------------------------------------------------------
  const onExport = async () => {
    const res = await fetch("/api/royalties/tracks");
    const json = await res.json();
    const songs = json.songs || [];

    const doc = new jsPDF({ unit: "pt" });

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Royalty Split Report", 40, 50);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 70);

    let y = 110;

    for (const s of songs) {
      const r = await fetch(`/api/royalties/splits/${s._id}`);
      const j = await r.json();
      const splits = j.splits || [];

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`${s.title}`, 40, y);
      y += 20;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Total Allocated: ${s.allocatedPercent}%`, 40, y);
      y += 20;

      doc.setFont("Helvetica", "bold");
      doc.text(`Splits:`, 40, y);
      y += 20;

      for (const sp of splits) {
        doc.setFont("Helvetica", "normal");

        doc.text(
          `• ${sp.collaboratorName} (${sp.percent}%) — ${
            sp.destination || sp.collaboratorEmail || "No payout set"
          }`,
          60,
          y
        );

        y += 18;

        if (y > 760) {
          doc.addPage();
          y = 60;
        }
      }

      y += 30;
      if (y > 760) {
        doc.addPage();
        y = 60;
      }
    }

    doc.save("royalty-splits.pdf");
  };

  // ---------------------------------------------------------------------------

  const onAdd = async () => {
    if (!selected) return alert("Select track");
    if (!newName || !newPct) return alert("Enter name & percent");

    const pct = Number(newPct);
    if (pct <= 0 || pct > 100) return alert("Invalid percent");
    if (sum(splits) + pct > 100) return alert("Total exceeds 100%");

    const res = await fetch(`/api/royalties/splits/${selected}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collaboratorName: newName,
        collaboratorEmail: newEmail,
        percent: pct,
      }),
    });

    const json = await res.json();
    if (json.error) return alert(json.error);

    setNewName("");
    setNewEmail("");
    setNewPct("");

    await loadSplits(selected);
    mutateTracks();
  };

  const onUpdatePct = async (splitId: string, percent: number) => {
    if (!selected) return;

    const res = await fetch(`/api/royalties/splits/${selected}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ splitId, percent }),
    });

    const json = await res.json();
    if (json.error) return alert(json.error);

    await loadSplits(selected);
    mutateTracks();
  };

  const onRemove = async (splitId: string) => {
    if (!selected) return;
    if (!confirm("Remove split?")) return;

    const res = await fetch(`/api/royalties/splits/${selected}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ splitId }),
    });

    const json = await res.json();
    if (json.error) return alert(json.error);

    await loadSplits(selected);
    mutateTracks();
  };

  const onInvite = async (splitId: string) => {
    const res = await fetch("/api/royalties/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ splitId }),
    });

    const j = await res.json();
    if (j.error) return alert(j.error);

    alert("Invite sent!");
    await loadSplits(selected);
  };

  const selectedTrack = tracksRes?.songs?.find((s: any) => s._id === selected);
  const aiSuggestions = useMemo(
    () => computeAiSplitSuggestions(selectedTrack),
    [selectedTrack]
  );

  const applySuggestion = async () => {
    if (!selected || !aiSuggestions.length) return;

    for (const s of aiSuggestions) {
      await fetch(`/api/royalties/splits/${selected}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collaboratorName: s.collaboratorName,
          percent: s.percent,
        }),
      });
    }

    await loadSplits(selected);
    mutateTracks();
  };

  return (
    <main className="min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* HEADER */}
        <motion.header
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-extrabold">Royalty Splits</h1>
            <p className="text-sm text-muted-foreground">
              Manage and export revenue allocations for your tracks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onExport}>
              <Download className="mr-2" /> Export PDF
            </Button>

            {/* INVITE COLLORATOR */}
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2" /> Invite collaborator
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite collaborator</DialogTitle>
                </DialogHeader>

                <Input
                  placeholder="Collaborator name"
                  className="mb-2"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />

                <Input
                  placeholder="Collaborator email"
                  className="mb-2"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />

                <Input
                  placeholder="Percent"
                  type="number"
                  className="mb-2"
                  value={newPct as any}
                  onChange={(e) => setNewPct(Number(e.target.value))}
                />

                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline">Cancel</Button>
                  <Button
                    onClick={async () => {
                      if (!selected) return alert("Select a track first");

                      const r = await fetch(
                        `/api/royalties/splits/${selected}`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            collaboratorName: newName,
                            collaboratorEmail: newEmail,
                            percent: Number(newPct) || 0,
                          }),
                        }
                      );

                      const j = await r.json();
                      if (j.error) return alert(j.error);

                      await fetch("/api/royalties/invite", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ splitId: j.split._id }),
                      });

                      setNewName("");
                      setNewEmail("");
                      setNewPct("");

                      await loadSplits(selected);
                      mutateTracks();
                      alert("Invite sent");
                    }}
                  >
                    Send Invite
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TRACK LIST */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-bold">Your Tracks</h3>
              <Badge>{tracksRes?.songs?.length ?? 0}</Badge>
            </CardHeader>

            <CardContent className="h-[500px] overflow-y-scroll">
              <div className="space-y-2">
                {tracksRes?.songs?.map((t: any) => (
                  <button
                    key={t._id}
                    onClick={() => {
                      setSelected(t._id);
                      loadSplits(t._id);
                    }}
                    className={`w-full text-left p-2 rounded 
                      ${
                        t._id === selected
                          ? "bg-black/5 dark:bg-white/10"
                          : "hover:bg-black/5 dark:hover:bg-white/10"
                      }
                    `}
                  >
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.allocatedPercent}% allocated · {t.splitsCount} splits
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* RIGHT PANEL */}
          <Card className="md:col-span-2">
            <CardHeader className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {selectedTrack?.title ?? "Select a track"}
                </h3>
                <div className="text-sm text-muted-foreground">
                  {sum(splits)}% allocated
                </div>
              </div>

              {selectedTrack && aiSuggestions.length > 0 && (
                <Button variant="outline" onClick={applySuggestion}>
                  <Sparkles size={16} className="mr-1" /> AI Auto-Split
                </Button>
              )}
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* TABLE */}
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
                    {loadingSplits && (
                      <tr>
                        <td colSpan={5}>Loading...</td>
                      </tr>
                    )}

                    {!loadingSplits &&
                      splits.map((s) => (
                        <TableRow key={s._id}>
                          <TableCell>{s.collaboratorName}</TableCell>

                          <TableCell>
                            <input
                              type="number"
                              aria-label="input-number"
                              min={0}
                              max={100}
                              value={s.percent}
                              onChange={(e) =>
                                onUpdatePct(s._id, Number(e.target.value))
                              }
                              className="w-20 p-1 border rounded text-sm bg-transparent"
                            />
                            %
                          </TableCell>

                          <TableCell>
                            {s.destination ?? s.collaboratorEmail ?? "—"}
                          </TableCell>

                          <TableCell>
                            {s.verified ? (
                              <Badge>Verified</Badge>
                            ) : (
                              <Badge variant="secondary">Unverified</Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onInvite(s._id)}
                            >
                              Invite
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemove(s._id)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </tbody>
                </Table>

                {/* ADD NEW SPLIT */}
                <div className="flex gap-2 items-center mt-4">
                  <Input
                    placeholder="Collaborator name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />

                  <Input
                    placeholder="Email (optional)"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />

                  <Input
                    placeholder="Percent"
                    type="number"
                    className="w-28"
                    value={newPct as any}
                    onChange={(e) => setNewPct(Number(e.target.value))}
                  />

                  <Button onClick={onAdd}>
                    <PlusCircle />
                  </Button>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground">
                  <strong>Notes:</strong> Splits must add up to 100% before payout
                  can be finalized. Invite collaborators so they can connect
                  payout accounts.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
