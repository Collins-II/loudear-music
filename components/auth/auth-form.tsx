"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Icons } from "@/components/icons"; // custom icon map

// -----------------------------
// 🎯 Zod Schema
// -----------------------------
const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: "Enter a valid email" }),
  role: z.enum(["fan", "artist"]),
  stageName: z.string().optional(),
  genres: z.array(z.string()).min(1, "Select at least one genre"),
  socialLinks: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string().url("Invalid URL format"),
      })
    )
    .optional(),
});

// -----------------------------
// 🎧 Genre List
// -----------------------------
export const GENRES = [
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

// -----------------------------
// 💬 Social Platforms
// -----------------------------
const SOCIAL_PLATFORMS = [
  { name: "Facebook", icon: Icons.facebook },
  { name: "Instagram", icon: Icons.instagram },
  { name: "Twitter", icon: Icons.twitter },
  { name: "YouTube", icon: Icons.youtube },
  { name: "TikTok", icon: Icons.tiktok },
  { name: "SoundCloud", icon: Icons.soundcloud },
];

export function AuthForm({ className }: React.ComponentProps<"div">) {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"fan" | "artist">("fan");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { role: "fan", genres: [], socialLinks: [] },
  });

  const handleNext = async () => {
    //const valid = await form.trigger();
    setStep((s) => s + 1);
  };

  const handleRegister = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      toast.success("Account created successfully!");
      await signIn("credentials", { email: values.email, redirect: true });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addSocialLink = (platform: string, url: string) => {
    const existing = form.getValues("socialLinks") || [];
    form.setValue("socialLinks", [
      ...existing,
      { platform, url },
    ]);
  };

  const removeSocial = (platform: string) => {
    const filtered = (form.getValues("socialLinks") || []).filter(
      (s: any) => s.platform !== platform
    );
    form.setValue("socialLinks", filtered);
  };

  // -----------------------------
  // 🧭 Step Configuration
  // -----------------------------
  const steps = [
    {
      id: "role",
      title: "Choose Your Role",
      content: (
        <div className="flex flex-col items-center gap-6">
          <Label className="text-lg font-semibold">
            Are you joining as a Fan or Artist?
          </Label>
          <RadioGroup
            value={role}
            onValueChange={(v) => {
              setRole(v as "fan" | "artist");
              form.setValue("role", v as "fan" | "artist");
            }}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fan" id="fan" />
              <Label htmlFor="fan">Fan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="artist" id="artist" />
              <Label htmlFor="artist">Artist</Label>
            </div>
          </RadioGroup>
          <Button onClick={handleNext} className="w-40 mt-6">
            Continue
          </Button>
        </div>
      ),
    },
    {
      id: "details",
      title: role === "artist" ? "Artist Details" : "Fan Preferences",
      content: (
        <div className="flex flex-col items-center gap-4">
          {role === "artist" && (
            <Input
              placeholder="Stage Name"
              {...form.register("stageName")}
              className="max-w-sm"
            />
          )}
          <MultiSelect
            options={GENRES.map((g) => ({ label: g, value: g }))}
            value={form.getValues("genres") || []} // get current value from form
            onChange={(vals: string[]) => form.setValue("genres", vals)}
            placeholder="Select your favorite genres"
            className="w-full max-w-sm"
           />

          <div className="flex justify-between w-full max-w-sm mt-6">
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
            <Button onClick={handleNext}>Continue</Button>
          </div>
        </div>
      ),
    },
    {
      id: "social",
      title: "Connect Socials",
      content: (
        <div className="flex flex-col items-center gap-6">
          <Label className="text-lg font-semibold">
            Link your social profiles (optional)
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 max-w-lg">
            {SOCIAL_PLATFORMS.map(({ name, icon: Icon }) => {
              const existing = (form.getValues("socialLinks") || []).find(
                (s: any) => s.platform === name
              );
              return (
                <Button
                  key={name}
                  variant={existing ? "default" : "outline"}
                  size="icon"
                  onClick={() => {
                    if (existing) removeSocial(name);
                    else {
                      const url = prompt(`Enter your ${name} profile URL:`);
                      if (url) addSocialLink(name, url);
                    }
                  }}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {(form.watch("socialLinks") || []).map((s: any) => (
              <Badge key={s.platform} variant="secondary">
                {s.platform}
              </Badge>
            ))}
          </div>

          <Button
            className="mt-6 w-40"
            onClick={form.handleSubmit(handleRegister)}
            disabled={loading}
          >
            {loading ? "Creating..." : "Finish Sign Up"}
          </Button>

          <div className="flex justify-between w-full max-w-sm mt-6">
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={`flex flex-col gap-6 h-full ${className}`}>
      <Card>
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="flex flex-col justify-center p-6 md:p-8">
            <div className="flex flex-col items-center text-center mb-4">
              <h1 className="text-2xl font-bold">
                {isLogin ? "Welcome back" : steps[step].title}
              </h1>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Login to your LoudEar account"
                  : "Join the LoudEar community"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-6 items-center"
                >
                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <Button onClick={() => signIn("google")} variant="outline">
                      Google
                    </Button>
                    <Button onClick={() => signIn("facebook")} variant="outline">
                      Facebook
                    </Button>
                  </div>
                  <div className="text-center text-sm mt-6">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="underline underline-offset-4"
                    >
                      Sign up
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={steps[step].id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4 }}
                >
                  {steps[step].content}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-muted relative hidden md:block">
            <Image
              src="/assets/images/cleo-04.jpg"
              fill
              alt="Auth"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs">
        By continuing, you agree to our{" "}
        <a href="#" className="underline">Terms of Service</a> and{" "}
        <a href="#" className="underline">Privacy Policy</a>.
      </div>
    </div>
  );
}
