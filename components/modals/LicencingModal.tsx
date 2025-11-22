// components/LicensingModal.tsx
"use client";

import React, { useState } from "react";
import { Dialog } from "@headlessui/react"; // or your UI sheet

type Tier = { id: string; title: string; price: number; description?: string; usageRights?: string[] };

export default function LicensingModal({ beat, open, onClose }: { beat: any; open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState<Tier | null>(beat?.licenseTiers?.[0] ?? null);


  const handleAddToCart = async () => {
    if (!selected) return;
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg rounded bg-white p-6">
          <Dialog.Title className="font-bold text-lg">{beat.title} — Choose License</Dialog.Title>
          <div className="mt-4 space-y-3">
            {beat.licenseTiers.map((t: Tier) => (
              <label key={t.id} className={`block border p-3 rounded ${selected?.id === t.id ? "border-indigo-500" : "border-gray-200"}`}>
                <input type="radio" name="license" checked={selected?.id === t.id} onChange={() => setSelected(t)} className="mr-2" />
                <span className="font-semibold">{t.title} — {t.price/100} USD</span>
                <div className="text-sm text-gray-600 mt-1">{t.description}</div>
                {t.usageRights && <ul className="text-xs text-gray-500 mt-2 list-disc ml-5">{t.usageRights.map(r=> <li key={r}>{r}</li>)}</ul>}
              </label>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
            <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
