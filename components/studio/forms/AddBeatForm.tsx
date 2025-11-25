"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, UploadCloud, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { uploadToCloudinary } from "@/lib/helpers";
import AudioSnippet from "@/components/soundhub/AudioSnippet";
import AutoPricing from "@/components/auto-pricing";


type LicenseTier = {
  id: string;
  title: string;
  price: number;
  description?: string;
  usageRights: string[];
};

export default function AddBeatForm() {
  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState<number | "">("");
  const [key, setKey] = useState("");
  const [price, setPrice] = useState(0);
  const [genre, setGenre] = useState("");
  const [published, setPublished] = useState(false);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  const [audioFull, setAudioFull] = useState<File | null>(null);
  const [audioFullUrl, setAudioFullUrl] = useState<string | null>(null);

  const [snippetUrl, setSnippetUrl] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const [licenseTiers, setLicenseTiers] = useState<LicenseTier[]>([]);

  const { getRootProps: coverRoot, getInputProps: coverInput } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop(files) {
      const f = files[0];
      setCoverFile(f);
      setCoverPreview(URL.createObjectURL(f));
    },
  });

  const { getRootProps: fullAudioRoot, getInputProps: fullAudioInput } = useDropzone({
    accept: { "audio/*": [] },
    multiple: false,
    onDrop(files) {
      const f = files[0];
      setAudioFull(f);
      setAudioFullUrl(URL.createObjectURL(f));
    },
  });

  const userFollowers = 12300; // <-- Replace later with real user data

  const addLicense = () =>
    setLicenseTiers((p) => [...p, { id: "", title: "", price: 0, description: "", usageRights: [] }]);

  const removeLicense = (i: number) =>
    setLicenseTiers((p) => p.filter((_, idx) => idx !== i));

  const updateLicense = (i: number, field: keyof LicenseTier, v: any) =>
    setLicenseTiers((p) => {
      const cp = [...p];
      (cp[i] as any)[field] = v;
      return cp;
    });

  /** Upload beat + snippet */
  const handleUploadAll = async () => {
    if (!title.trim()) return toast.error("Title required");
    if (!audioFull) return toast.error("Full audio required");
    if (!snippetUrl) return toast.error("Generate snippet first");

    setUploading(true);

    try {
      let uploadedAudioUrl = audioFullUrl;
      if (!uploadedAudioUrl || uploadedAudioUrl.startsWith("blob:")) {
        const up = await uploadToCloudinary(audioFull, "beats/files", "video", (p) => setProgressPercent(p));
        uploadedAudioUrl = up.secure_url;
      }

      let coverUrl;
      if (coverFile) {
        const up = await uploadToCloudinary(coverFile, "beats/thumbnails", "image", (p) => setProgressPercent(p));
        coverUrl = up.secure_url;
      }

      const fd = new FormData();
      fd.append("title", title);
      fd.append("bpm", String(bpm));
      fd.append("key", key);
      fd.append("price", String(price));
      fd.append("genre", genre);
      fd.append("published", String(published));
      fd.append("audioUrl", uploadedAudioUrl!);
      fd.append("audioSnippet", snippetUrl);
      if (coverUrl) fd.append("image", coverUrl);
      fd.append("licenseTiers", JSON.stringify(licenseTiers));

      const res = await fetch("/api/beat", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());

      toast.success("Beat uploaded!");

    } catch (err: any) {
      toast.error(err.message);
    }

    setUploading(false);
  };

  return (
    <SheetContent>
      <ScrollArea className="h-screen">
        <SheetHeader>
          <SheetTitle>Add Beat</SheetTitle>

          <SheetDescription asChild>
            <div className="space-y-6 px-4">

              {/* META */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div><Label>BPM</Label><Input type="number" value={bpm} onChange={(e) => setBpm(e.target.value === "" ? "" : Number(e.target.value))} /></div>
                <div><Label>Key</Label><Input value={key} onChange={(e) => setKey(e.target.value)} /></div>
                <div><Label>Genre</Label><Input value={genre} onChange={(e) => setGenre(e.target.value)} /></div>
              </div>

              {/* AUTO PRICING */}
<div className="space-y-3">
  <Label>Automatic Pricing</Label>

  <AutoPricing
    followers={userFollowers}
    basePrice={price}
    onPriceChange={(val) => setPrice(val)}
  />

  <p className="text-xs text-muted-foreground">
    Final price: <span className="font-semibold">K{price}</span>
  </p>
 </div>


              {/* COVER */}
              <div {...coverRoot()} className="border-2 border-dashed p-4 rounded-xl text-center">
                <input {...coverInput()} />
                {coverPreview ? (
                  <Image src={coverPreview} width={300} height={300} alt="cover" className="mx-auto rounded-xl" />
                ) : (
                  <div className="text-neutral-400">
                    <UploadCloud className="w-8 h-8 mx-auto mb-2" />
                    Upload cover
                  </div>
                )}
              </div>

              {/* FULL AUDIO UPLOAD */}
              <div {...fullAudioRoot()} className="border-2 border-dashed p-4 rounded-xl text-center">
                <input {...fullAudioInput()} />
                {audioFull ? <p className="text-green-400">{audioFull.name}</p> : (
                  <div className="text-neutral-400">
                    <UploadCloud className="w-8 h-8 mx-auto mb-2" /> Upload audio
                  </div>
                )}
              </div>

              {/* AUDIO SNIPPET COMPONENT */}
              <AudioSnippet
                audioUrl={audioFullUrl}
                onSnippetGenerated={(url: any) => setSnippetUrl(url)}
              />

              {/* LICENSE TIERS */}
              <div className="space-y-4">
                <h2 className="font-semibold text-xl">License Tiers</h2>

                {licenseTiers.map((tier, i) => (
                  <div key={i} className="border p-4 rounded-xl">
                    <div className="flex justify-between">
                      <h3>{tier.title || `License ${i + 1}`}</h3>
                      <Button variant="destructive" size="icon" onClick={() => removeLicense(i)}>
                        <Trash size={15} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div><Label>ID</Label><Input value={tier.id} onChange={(e) => updateLicense(i, "id", e.target.value)} /></div>
                      <div><Label>Title</Label><Input value={tier.title} onChange={(e) => updateLicense(i, "title", e.target.value)} /></div>
                      <div><Label>Price</Label><Input type="number" value={tier.price} onChange={(e) => updateLicense(i, "price", Number(e.target.value))} /></div>
                      <div><Label>Description</Label><Textarea value={tier.description} onChange={(e) => updateLicense(i, "description", e.target.value)} /></div>
                      <div className="col-span-2">
                        <Label>Usage Rights</Label>
                        <Textarea
                          value={tier.usageRights.join("\n")}
                          onChange={(e) => updateLicense(i, "usageRights", e.target.value.split("\n").filter(Boolean))}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addLicense}><Plus size={16} /> Add License</Button>
              </div>

              {/* PUBLISH */}
              <div className="flex gap-3 items-center">
                <input aria-label="checkbox-input" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                <Label>Publish Beat</Label>
              </div>

              <div className="space-y-2">
                <div className="text-sm">Upload progress: {progressPercent}%</div>
                <Button className="w-full" onClick={handleUploadAll} disabled={uploading}>
                  {uploading ? <Loader2 className="mr-2 animate-spin" /> : "Upload Beat"}
                </Button>
              </div>

            </div>
          </SheetDescription>
        </SheetHeader>
      </ScrollArea>
    </SheetContent>
  );
}
