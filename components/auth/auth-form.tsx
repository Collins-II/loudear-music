"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
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

// -----------------------------
// 🎯 Validation Schema
// -----------------------------
const formSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(["fan", "artist"]),
  stageName: z.string().optional(),
  genres: z.array(z.string()).min(1, "Select at least one genre"),
  socials: z.record(z.string(), z.string().url()).optional(),
});

// -----------------------------
// 🎧 Genre Options
// -----------------------------
const GENRES = [
  "Afrobeat", "Hip-Hop", "Pop", "R&B", "Gospel", "Dancehall",
  "House", "Rock", "Jazz", "Classical", "Reggae", "Electronic",
];

// -----------------------------
// 🪩 Socials Metadata
// -----------------------------
const SOCIALS = [
  { id: "facebook", label: "Facebook", icon: Icons.facebook },
  { id: "instagram", label: "Instagram", icon: Icons.instagram },
  { id: "twitter", label: "Twitter", icon: Icons.twitter },
  { id: "youtube", label: "YouTube", icon: Icons.youtube },
  { id: "tiktok", label: "TikTok", icon: Icons.tiktok },
  { id: "soundcloud", label: "SoundCloud", icon: Icons.soundcloud },
];

export function RegisterForm({ className }: React.ComponentProps<"div">) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"fan" | "artist">("fan");
  const [activeSocials, setActiveSocials] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "fan",
      genres: [],
      socials: {},
    },
  });

  const nextStep = async () => {
    //const valid = await form.trigger();
    setStep((s) => s + 1);
  };
  const prevStep = () => setStep((s) => s - 1);

  const handleRegister = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      toast.success("Account created successfully! Redirecting...");
      window.location.href = "/auth/login";
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // 🪜 Step Data
  // -----------------------------
  const steps = [
    { id: "role", label: "Role" },
    { id: "details", label: "Details" },
    { id: "genres", label: "Genres" },
    { id: "socials", label: "Socials" },
  ];

  // -----------------------------
  // ⚙️ Step Components
  // -----------------------------
  const renderStep = () => {
    switch (steps[step].id) {
      case "role":
        return (
          <div className="flex flex-col items-center gap-6">
            <RadioGroup
              value={role}
              onValueChange={(v) => {
                setRole(v as "fan" | "artist");
                form.setValue("role", v as "fan" | "artist");
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
                  <RadioGroupItem value={r} /> {r.charAt(0).toUpperCase() + r.slice(1)}
                </Label>
              ))}
            </RadioGroup>
            <Button onClick={nextStep} className="w-40 mt-6">
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
            transition={{ duration: 0.4 }}
          >
            <Input placeholder="Full Name" {...form.register("name")} className="max-w-sm" />
            <Input placeholder="Email Address" type="email" {...form.register("email")} className="max-w-sm" />
            {role === "artist" && (
              <Input placeholder="Stage Name" {...form.register("stageName")} className="max-w-sm" />
            )}
            <div className="flex justify-between w-full max-w-sm mt-6">
              <Button variant="outline" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep}>Continue</Button>
            </div>
          </motion.div>
        );

      case "genres":
        return (
          <motion.div
            key="genres"
            className="flex flex-col items-center gap-4 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <MultiSelect
              options={GENRES.map((g) => ({ label: g, value: g }))}
              value={form.getValues("genres")}
              onChange={(vals: string[]) => form.setValue("genres", vals)}
              placeholder="Select genres"
              className="w-full max-w-sm"
            />
            <div className="flex justify-between w-full max-w-sm mt-6">
              <Button variant="outline" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep}>Continue</Button>
            </div>
          </motion.div>
        );

      case "socials":
        return (
          <motion.div
            key="socials"
            className="flex flex-col gap-4 items-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Icon Picker */}
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
                      "w-12 h-12 flex items-center justify-center rounded-full border shadow-md transition-colors",
                      isActive ? "bg-primary text-white" : "border-muted hover:bg-muted/30"
                    )}
                    title={label}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.button>
                );
              })}
            </div>

            {/* Dynamic Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              {activeSocials.map((id) => {
                const { label, icon: Icon } = SOCIALS.find((s) => s.id === id)!;
                return (
                  <div key={id} className="flex items-center gap-2 bg-muted/20 p-2 rounded-md">
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
              <Button variant="outline" onClick={prevStep}>Back</Button>
              <Button
                onClick={form.handleSubmit(handleRegister)}
                disabled={loading}
                className="w-40"
              >
                {loading ? "Creating..." : "Finish Sign Up"}
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 h-full", className)}>
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left Section */}
          <div className="flex flex-col justify-center p-6 md:p-8 gap-4">
            {/* Progress Bar */}
            <div className="flex justify-between items-center mb-6">
              {steps.map((s, i) => (
                <motion.div
                  key={s.id}
                  className="flex-1 h-2 mx-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: i <= step ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                  style={{ backgroundColor: i <= step ? "#7c3aed" : "#d1d5db" }}
                />
              ))}
            </div>

            <div className="flex flex-col items-center text-center mb-6">
              <motion.div
                className="relative flex items-center justify-center w-24 h-24 mx-auto rounded-full overflow-hidden shadow-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src="/assets/logo/logo-pi.jpg"
                  alt="LoudEar Logo"
                  fill
                  className="object-cover"
                />
              </motion.div>
              <h1 className="text-2xl font-bold mt-4 tracking-wide text-gradient">
                {steps[step].label}
              </h1>
              <p className="text-muted-foreground mt-1">
                {step === 0
                  ? "Choose your role to get started"
                  : step === 1
                  ? "Tell us about yourself"
                  : step === 2
                  ? "Pick your favorite genres"
                  : "Link your socials (optional)"}
              </p>
            </div>

            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </div>

          {/* Right Section */}
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
        <a href="#" className="underline underline-offset-2 hover:text-primary transition">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-2 hover:text-primary transition">
          Privacy Policy
        </a>.
      </div>
    </div>
  );
}
