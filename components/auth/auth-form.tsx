"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { IUser } from "@/lib/database/models/user";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";

// -----------------------------
// 🎯 Validation Schema
// -----------------------------
const formSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  bio: z.string().min(30, "Please enter a longer bio"),
  location: z.string().min(2, "Enter location"),
  phone: z.string().optional(),
  role: z.enum(["fan", "artist"]),
  stageName: z.string().optional(),
  genres: z.array(z.string()).min(1, "Select at least one genre"),
  socials: z.record(z.string(), z.string().url("Enter a valid URL")).optional(),
  payout: z
    .object({
      network: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  image: z.any().optional(),
});

const GENRES = [
  "Afrobeat",
  "Hip-Hop",
  "Pop",
  "R&B",
  "Gospel",
  "Dancehall",
  "House",
  "Rock",
  "Jazz",
  "Classical",
  "Reggae",
  "Electronic",
];
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

export function RegisterForm({
  user,
  className,
}: {
  user: IUser;
  className?: string;
}) {
  const { update } = useSession();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"fan" | "artist">(user?.role || "fan");
  const [activeSocials, setActiveSocials] = useState<string[]>([]);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      location: user?.location || "",
      bio: user?.bio || "",
      phone: user?.phone || "",
      role: user?.role || "fan",
      stageName: user?.stageName || "",
      genres: user?.genres || [],
      socials: user?.socialLinks || {},
      payout: {
        network: user?.payment?.mobileMoney?.provider || "",
        phone: user?.payment?.mobileMoney?.phoneNumber || "",
      },
    },
  });

  const watchedValues = useWatch({ control: form.control });

  // -----------------------------
  // 🧩 Smart Bio Suggestion
  // -----------------------------
  const handleBioSuggest = () => {
    const genres = form.watch("genres");
    const name = user?.name?.split(" ")[0] || "music lover";
    let suggestion = "";
    if (role === "artist")
      suggestion = `I’m ${name}, an artist passionate about ${
        genres[0] || "music"
      } and creating sounds that connect people.`;
    else
      suggestion = `I’m ${name}, a huge fan of ${
        genres[0] || "great"
      } music and discovering new artists.`;

    form.setValue("bio", suggestion);
  };

  // -----------------------------
  // 🌍 Detect Location
  // -----------------------------
  const detectLocation = async () => {
    setDetectingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        const locationString =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.state ||
          data.address.country;
        if (locationString) form.setValue("location", locationString);
        setDetectingLocation(false);
      });
    } else {
      toast.info("Location not available");
      setDetectingLocation(false);
    }
  };

  // -----------------------------
  // 💾 Handle Submit (Fixed)
  // -----------------------------
  const handleRegister = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const formData = new FormData();

      Object.entries(values).forEach(([key, val]) => {
        if (key === "socials" || key === "payout" || key === "genres") {
          formData.append(key, JSON.stringify(val));
        } else if (key === "image" && val instanceof File) {
          formData.append("image", val);
        } else if (val !== undefined && val !== null) {
          formData.append(key, val as any);
        }
      });

      const res = await fetch("/api/users/update", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      await update({
        user: {
          stageName: data.user.stageName,
          role: data.user.role,
          image: data.user.image,
          location: data.user.location,
          bio: data.user.bio,
          phone: data.user.phone,
          genres: data.user.genres,
          isNewUser: false,
        },
      });

      toast.success("Profile updated successfully!");
      window.location.href = "/studio/dashboard";
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // 🧮 Profile Completion Logic (reactive)
  // -----------------------------
  const completion = (() => {
    const vals = watchedValues;
    const total = role === "artist" ? 8 : 4;
    let filled = 0;

    if (vals.name) filled++;
    if (vals.location) filled++;
    if (vals.bio && vals.bio.length > 10) filled++;
    if (vals.genres?.length) filled++;
    if (role === "artist") {
      if (vals.stageName) filled++;
      if (vals.socials && Object.values(vals.socials).some((v) => v)) filled++;
      if (vals.payout?.network && vals.payout?.phone) filled++;
      //if (vals.image) filled++;
    }
    return Math.round((filled / total) * 100);
  })();

  // -----------------------------
  // Steps Definition
  // -----------------------------
  const steps =
    role === "artist"
      ? [
          { id: "role", label: "Role" },
          { id: "details", label: "Details" },
          { id: "genres", label: "Genres" },
          { id: "socials", label: "Socials" },
          { id: "payout", label: "Payout" },
        ]
      : [{ id: "role", label: "Role" }, { id: "genres", label: "Genres" }];

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // -----------------------------
  // Step Renderer (unchanged, except final button wired)
  // -----------------------------
  const renderStep = () => {
    const current = steps[step].id;

    switch (current) {
      case "role":
        return (
          <div className="flex flex-col items-center gap-6">
            <RadioGroup
              value={role}
              onValueChange={(v) => {
                const newRole = v as "fan" | "artist";
                setRole(newRole);
                form.setValue("role", newRole);
              }}
              className="flex gap-8 mt-4"
            >
              {["fan", "artist"].map((r) => (
                <Label
                  key={r}
                  className={cn(
                    "cursor-pointer flex items-center gap-2 text-lg font-semibold",
                    role === r ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <RadioGroupItem value={r} />{" "}
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Label>
              ))}
            </RadioGroup>
            <Button type="button" onClick={nextStep} className="w-40 mt-6">
              Continue
            </Button>
          </div>
        );

      case "details":
        return (
          <motion.div
            key="details"
            className="flex flex-col items-center gap-4 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {role === "artist" && (
              <Input
                placeholder="Stage Name"
                {...form.register("stageName")}
                className="max-w-sm"
              />
            )}

            <div className="flex items-center gap-2 max-w-sm w-full">
              <Input
                placeholder="Enter location"
                {...form.register("location")}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={detectLocation}
                disabled={detectingLocation}
              >
                {detectingLocation ? "Detecting..." : "Detect"}
              </Button>
            </div>

            <Textarea
              placeholder="Tell us about yourself..."
              {...form.register("bio")}
              className="max-w-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBioSuggest}
            >
              Suggest Bio
            </Button>

            <div className="flex justify-between w-full max-w-sm mt-6">
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button type="button" onClick={nextStep}>Continue</Button>
            </div>
          </motion.div>
        );

      case "genres":
        return (
          <motion.div
            key="genres"
            className="flex flex-col items-center gap-4 w-full"
          >
            <MultiSelect
              options={GENRES.map((g) => ({ label: g, value: g }))}
              value={form.watch("genres")}
              onChange={(vals) => form.setValue("genres", vals)}
              placeholder="Select your favorite genres"
              className="w-full max-w-sm"
            />
            <div className="flex justify-between w-full max-w-sm mt-6">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
              )}
              <Button type="button" onClick={nextStep}>
                {role === "artist" ? "Continue" : "Finish"}
              </Button>
            </div>
          </motion.div>
        );

      case "socials":
        return (
          <motion.div
            key="socials"
            className="flex flex-col items-center gap-4 w-full"
          >
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              {SOCIALS.map(({ id, icon: Icon, label }) => {
                const isActive = activeSocials.includes(id);
                return (
                  <motion.button
                    key={id}
                    onClick={() => {
                      if (isActive) {
                        setActiveSocials((p) => p.filter((s) => s !== id));
                        form.setValue(`socials.${id}` as any, "");
                      } else {
                        setActiveSocials((p) => [...p, id]);
                      }
                    }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "w-12 h-12 flex items-center justify-center rounded-full border shadow-md",
                      isActive ? "bg-primary text-white" : "border-muted"
                    )}
                    title={label}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              {activeSocials.map((id) => {
                const { label, icon: Icon } = SOCIALS.find((s) => s.id === id)!;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 bg-muted/20 p-2 rounded-md"
                  >
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder={`${label} URL`}
                      {...form.register(`socials.${id}` as const)}
                      className="flex-1"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between w-full max-w-sm mt-6">
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button type="button" onClick={nextStep}>Continue</Button>
            </div>
          </motion.div>
        );

      case "payout":
        return (
          <motion.div
            key="payout"
            className="flex flex-col items-center gap-4 w-full"
          >
            <Label className="text-sm font-semibold">
              Mobile Money Network
            </Label>
            <RadioGroup
              value={form.watch("payout.network")}
              onValueChange={(v) => form.setValue("payout.network", v)}
              className="flex flex-wrap gap-3"
            >
              {NETWORKS.map(({ id, label }) => (
                <Label key={id} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value={id} /> {label}
                </Label>
              ))}
            </RadioGroup>

            <Input
              placeholder="Mobile Money Number"
              {...form.register("payout.phone")}
              className="max-w-sm"
            />

            <div className="flex justify-between w-full max-w-sm mt-6">
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button
                type="submit"
                onClick={form.handleSubmit(handleRegister)}
                disabled={loading}
                className="w-40"
              >
                {loading ? "Saving..." : "Finish"}
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // -----------------------------
  // 💅 Render Layout
  // -----------------------------
  return (
    <form
      onSubmit={form.handleSubmit(handleRegister)}
      className={cn("flex flex-col gap-6 h-full", className)}
    >
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="flex flex-col justify-center p-6 md:p-8 gap-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="ml-3 text-xs text-muted-foreground">
                {completion}% Complete
              </span>
            </div>
            <div className="flex flex-col items-center text-center mb-6">
              <h1 className="text-muted-foreground text-lg font-semibold">
                Welcome{" "}
                <span className="text-black text-2xl font-semibold capitalize">
                  {user?.name?.split(" ")[0] || "User"}!
                </span>
              </h1>
              <p className="text-muted-foreground text-sm">
                {steps[step]?.label || ""}
              </p>
              <motion.div
                className="relative flex items-center justify-center w-24 h-24 mx-auto rounded-full overflow-hidden shadow-md mt-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Image
                  src="/assets/logo/logo-pi.jpg"
                  alt="LoudEar Logo"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </div>
          <div className="bg-muted relative hidden md:block rounded-l-2xl overflow-hidden">
            <Image
              src="/assets/images/yomaps-01.jpg"
              fill
              alt="Register"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs mt-2">
        By signing up, you agree to our{" "}
        <a href="#" className="underline hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-primary">
          Privacy Policy
        </a>
        .
      </div>
    </form>
  );
}
