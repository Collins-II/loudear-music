import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import NextTopLoader from "nextjs-toploader";
import ReduxProvider from "@/lib/provider/redux_provider";
import GlobalAudioPlayer from "@/components/global_audio_player";
import Script from "next/script";
import GoogleProvider from "@/lib/provider/google_provider";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { getCurrentUser } from "@/actions/getCurrentUser";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://loudear.com";

export const metadata: Metadata = {
  title: "LoudEar – Music & Video Streaming",
  description:
    "Stream, download, and discover music and videos on LoudEar. A modern platform for artists, creators, and music lovers.",
  metadataBase: new URL(BASE_URL),

  applicationName: "LoudEar",
  manifest: "/manifest.json",
  themeColor: "#161616",

  icons: {
    icon: [
      { url: "/assets/logo/logo-blu.jpg", type: "image/jpg", sizes: "32x32" },
      { url: "/assets/logo/logo-blu.jpg", type: "image/jpg", sizes: "16x16" },
    ],
    apple: { url: "/assets/logo/logo-blu.jpg", sizes: "180x180" },
    other: [
      {
        rel: "mask-icon",
        url: "/assets/logo/logo-blu.jpg",
        color: "#161616",
      },
      {
        rel: "manifest",
        url: "/manifest.json",
      },
    ],
  },

  openGraph: {
    title: "LoudEar – Stream Music & Videos",
    description:
      "Discover trending beats, music videos, and exclusive artist releases. Enjoy high-quality streaming on LoudEar.",
    url: BASE_URL,
    siteName: "LoudEar",
    images: [
      {
        url: `${BASE_URL}/assets/logo/logo-blu.jpg`,
        width: 1200,
        height: 630,
        alt: "LoudEar Preview",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "LoudEar – Music & Video Streaming",
    description:
      "Stream, download, and discover the latest music & videos from artists worldwide.",
    images: [`${BASE_URL}/assets/logo/logo-blu.jpg`],
  },
};


export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;
   const session = await getCurrentUser();

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* ✅ Google AdSense */}
        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-white`}
      >
                {/* Inject USER ID into window */}
        <Script id="user-id">
          {`
            window.__USER_ID__ = "${session?._id ?? ""}";
          `}
        </Script>
        {/* Top loader */}
        <Toaster />
        <NextTopLoader color="#fff" showSpinner={false} />
        <GoogleProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
        <ReduxProvider>
          <div className="relative min-h-screen flex flex-col overflow-hidden">
            {/* Decorative Billboard-inspired Backgrounds */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Global Audio Player (always pinned bottom) */}
            <GlobalAudioPlayer />
          </div>
        </ReduxProvider>
        </ThemeProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
