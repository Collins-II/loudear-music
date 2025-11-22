"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { useSession } from "next-auth/react";
import { IUser } from "@/lib/database/models/user";

const GENRES = ["Afrobeat","Hip-Hop","Pop","R&B","Gospel","Dancehall","House","Rock","Jazz","Classical","Reggae","Electronic"];
const NETWORKS = [
  { id: "MTN", label: "MTN Mobile Money" },
  { id: "Airtel", label: "Airtel Money" },
  { id: "Zamtel", label: "Zamtel Kwacha" },
  { id: "Other", label: "Other" },
];
const SOCIALS = [
  { id: "facebook", label: "Facebook", icon: Icons.facebook },
  { id: "instagram", label: "Instagram", icon: Icons.instagram },
  { id: "twitter", label: "Twitter/X", icon: Icons.twitter },
  { id: "youtube", label: "YouTube", icon: Icons.youtube },
  { id: "tiktok", label: "TikTok", icon: Icons.tiktok },
  { id: "soundcloud", label: "SoundCloud", icon: Icons.soundcloud },
  { id: "website", label: "Website", icon: Icons.website },
];

export function RegisterForm({ user, className }: { user: IUser; className?: string }) {
  const { update , data: session } = useSession();

  // Step & Loading
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Form state
  const [name ] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [phone] = useState(user?.phone || "");
  const [role, setRole] = useState<"fan" | "artist">(user?.role || "fan");
  const [stageName, setStageName] = useState(user?.stageName || "");
  const [genres, setGenres] = useState<string[]>(user?.genres || []);
  const [socials, setSocials] = useState<Record<string,string>>(user?.socialLinks || {});
  const [payoutNetwork, setPayoutNetwork] = useState(user?.payment?.mobileMoney?.provider || "");
  const [payoutPhone, setPayoutPhone] = useState(user?.payment?.mobileMoney?.phoneNumber || "");

  const [activeSocials, setActiveSocials] = useState<string[]>(Object.keys(socials));

  // Image upload
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(
    typeof user?.image === "string" ? user.image : null
  );

  useEffect(() => {
    return () => {
      if (localImagePreview?.startsWith("blob:")) URL.revokeObjectURL(localImagePreview);
    };
  }, [localImagePreview]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setLocalImageFile(file);
      setLocalImagePreview(url);
    },
  });

  const detectLocation = async () => {
    setDetectingLocation(true);
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const locationString = data.address?.city || data.address?.town || data.address?.village || data.address?.state || data.address?.country;
        if (locationString) setLocation(locationString);
        setDetectingLocation(false);
      }, () => {
        toast.error("Could not find location");
        setDetectingLocation(false);
      });
    } catch {
      toast.error("Location detection failed");
      setDetectingLocation(false);
    }
  };

  const handleBioSuggest = () => {
    const nameFirst = name.split(" ")[0] || "music lover";
    const suggestion = role === "artist"
      ? `I’m ${nameFirst}, an artist passionate about ${genres[0] || "music"} and creating sounds that connect people.`
      : `I’m ${nameFirst}, a huge fan of ${genres[0] || "great"} music and discovering new artists.`;
    setBio(suggestion);
  };

async function uploadImageToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", "loudear/avatars");

  const res = await fetch("/api/upload/cloudinary", {
    method: "POST",
    body: fd,
  });

  const data = await res.json();
  console.log("CLOUD_AUTH_IMG", data.secure_url)
  if (!res.ok) throw new Error(data.error || "Cloud upload failed");
  return data.secure_url;
}

const handleRegister = async () => {
  setLoading(true);

  try {
    let finalImageUrl = user?.image || null;

    // Upload only if new file selected
    if (localImageFile) {
      finalImageUrl = await uploadImageToCloudinary(localImageFile);
    }

    const payload = new FormData();
    payload.append("name", name);
    payload.append("bio", bio);
    payload.append("location", location);
    payload.append("phone", phone);
    payload.append("role", role);
    payload.append("stageName", role === "artist" ? stageName : "");
    payload.append("genres", JSON.stringify(genres));
    payload.append("socials", JSON.stringify(socials));
    payload.append("payout", JSON.stringify({ network: payoutNetwork, phone: payoutPhone }));
    payload.append("imageUrl", finalImageUrl || "");

    const res = await fetch("/api/users/update", {
      method: "PATCH",
      body: payload,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Update failed");

    // 🔥 FIXED — NextAuth session update
    await update({
      user: {
        ...session?.user,
        name: data.user.name,
        stageName: data.user.stageName,
        image: data.user.image,
        location: data.user.location,
        role: data.user.role,
        isNewUser: false,
      },
    });

    toast.success("Profile updated!");
    window.location.href = "/studio/dashboard";
  } catch (err: any) {
    toast.error(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};


  const completion = Math.round(
    (([name, location, bio, stageName, genres.length, Object.values(socials).filter(Boolean).length, payoutNetwork, payoutPhone, localImagePreview].filter(Boolean).length)
      / (role === "artist" ? 8 : 4)) * 100
  );

  const steps = role === "artist"
    ? ["role", "details", "genres", "socials", "payout"]
    : ["role", "genres"];

  const nextStep = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  // ------------------------------------------------
  // RENDER STEP
  // ------------------------------------------------
  const renderStep = () => {
    const current = steps[step];

    if (current === "role") {
      return (
        <div className="flex flex-col items-center gap-6">
          <RadioGroup value={role} onValueChange={(v) => setRole(v as any)} className="flex gap-6 mt-4">
            {["fan", "artist"].map((r) => (
              <Label key={r} className={cn("cursor-pointer flex items-center gap-2 text-lg font-semibold", role === r ? "text-primary" : "text-muted-foreground")}>
                <RadioGroupItem value={r} /> {r.charAt(0).toUpperCase() + r.slice(1)}
              </Label>
            ))}
          </RadioGroup>

          <div className="flex flex-col items-center gap-3">
            <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-md">
              {localImagePreview ? (
                <Image src={localImagePreview} alt="Preview" fill className="object-cover" />
              ) : user?.image ? (
                <Image src={user.image} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                  <Icons.user className="w-10 h-10" />
                </div>
              )}
            </div>

            <div {...getRootProps()} className="flex items-center gap-2">
              <input {...getInputProps()} />
              <Button variant="outline" className="px-3 py-1">Change Image</Button>
              {(localImagePreview || user?.image) && (
                <Button variant="ghost" type="button" onClick={() => { setLocalImageFile(null); setLocalImagePreview(null); }}>
                  Remove
                </Button>
              )}
            </div>
          </div>

          <Button onClick={nextStep} className="w-40 mt-4">Continue</Button>
        </div>
      );
    }

    if (current === "details") {
      return (
        <motion.div className="flex flex-col items-center gap-4 w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {role === "artist" && <Input placeholder="Stage Name" value={stageName} onChange={e => setStageName(e.target.value)} className="max-w-sm" />}
          <div className="flex items-center gap-2 max-w-sm w-full">
            <Input placeholder="Enter location" value={location} onChange={e => setLocation(e.target.value)} className="flex-1" />
            <Button type="button" variant="outline" size="sm" onClick={detectLocation} disabled={detectingLocation}>
              {detectingLocation ? "Detecting..." : "Detect"}
            </Button>
          </div>
          <Textarea placeholder="Tell us about yourself..." value={bio} onChange={e => setBio(e.target.value)} className="max-w-sm" />
          <Button variant="outline" size="sm" onClick={handleBioSuggest}>Suggest Bio</Button>
          <div className="flex justify-between w-full max-w-sm mt-6">
            <Button variant="outline" onClick={prevStep}>Back</Button>
            <Button onClick={nextStep}>Continue</Button>
          </div>
        </motion.div>
      );
    }

    if (current === "genres") {
      return (
        <motion.div className="flex flex-col items-center gap-4 w-full">
          <MultiSelect options={GENRES.map(g => ({label:g,value:g}))} value={genres} onChange={setGenres} placeholder="Select your favorite genres" className="w-full max-w-sm" />
          <div className="flex justify-between w-full max-w-sm mt-6">
            {step > 0 && <Button variant="outline" onClick={prevStep}>Back</Button>}
            {role === "fan" ? <Button onClick={handleRegister} disabled={loading}>{loading ? "Saving..." : "Finish"}</Button> : <Button onClick={nextStep}>Continue</Button>}
          </div>
        </motion.div>
      );
    }

    if (current === "socials") {
      return (
        <motion.div className="flex flex-col items-center gap-4 w-full">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {SOCIALS.map(({ id, icon: Icon }) => {
              const active = activeSocials.includes(id);
              return (
                <motion.button key={id} type="button" whileTap={{ scale:0.9 }} onClick={() => {
                  if (active) { setActiveSocials(s => s.filter(x=>x!==id)); setSocials({...socials, [id]:""}); }
                  else setActiveSocials(s => [...s,id]);
                }} className={cn("w-12 h-12 flex items-center justify-center rounded-full border shadow-md", active ? "bg-primary text-white" : "border-muted")}>
                  <Icon className="w-6 h-6" />
                </motion.button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
            {activeSocials.map(id => {
              const s = SOCIALS.find(x=>x.id===id)!;
              return (
                <div key={id} className="flex items-center gap-2 bg-muted/20 p-2 rounded-md">
                  <s.icon className="w-5 h-5 text-muted-foreground" />
                  <Input placeholder={`${s.label} URL`} value={socials[id] || ""} onChange={e => setSocials({...socials,[id]:e.target.value})} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between w-full max-w-sm mt-6">
            <Button variant="outline" onClick={prevStep}>Back</Button>
            <Button onClick={nextStep}>Continue</Button>
          </div>
        </motion.div>
      );
    }

    if (current === "payout") {
      return (
        <motion.div className="flex flex-col items-center gap-4 w-full">
          <Label className="text-sm font-semibold">Mobile Money Network</Label>
          <RadioGroup value={payoutNetwork} onValueChange={setPayoutNetwork} className="flex flex-wrap gap-3">
            {NETWORKS.map(n => <Label key={n.id} className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value={n.id} />{n.label}</Label>)}
          </RadioGroup>
          <Input placeholder="Mobile Money Number" value={payoutPhone} onChange={e=>setPayoutPhone(e.target.value)} className="max-w-sm"/>
          <div className="flex justify-between w-full max-w-sm mt-6">
            <Button variant="outline" onClick={prevStep}>Back</Button>
            <Button onClick={handleRegister} disabled={loading}>{loading ? "Saving..." : "Finish"}</Button>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="flex flex-col justify-center p-6 md:p-8 gap-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div className="h-full bg-primary" animate={{ width: `${completion}%` }} transition={{ duration:0.5 }}/>
              </div>
              <span className="ml-3 text-xs text-muted-foreground">{completion}% Complete</span>
            </div>

            <div className="flex flex-col items-center text-center mb-6">
              <h1 className="text-muted-foreground text-lg font-semibold">Welcome <span className="text-black text-2xl font-semibold capitalize">{user?.name?.split(" ")[0] || "User"}!</span></h1>
              <p className="text-muted-foreground text-sm">{steps[step]}</p>
            </div>

            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </div>
          {/* SIDE IMAGE */}
          <div className="bg-muted relative hidden md:block rounded-l-2xl overflow-hidden">
            <Image
              src="/assets/images/yomaps-01.jpg"
              fill
              alt="Register"
              className="object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
