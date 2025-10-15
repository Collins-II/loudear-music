import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import NextTopLoader from "nextjs-toploader";
import ReduxProvider from "@/lib/provider/redux_provider";
import Footer from "@/components/footer";
import GlobalAudioPlayer from "@/components/global_audio_player";
import Script from "next/script";
import GoogleProvider from "@/lib/provider/google_provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LoudEar | Music & Video Streaming",
  description:
    "LoudEar — Stream, download, and discover music and videos. A modern Artist-inspired platform for music lovers.",
  manifest: "/manifest.json", // ✅ PWA support
  themeColor: "#ff0050",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* ✅ Google AdSense */}
        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
        />

        {/* ✅ PWA Meta */}
        <meta name="application-name" content="LoudEar" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LoudEar" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-white`}
      >
        {/* Top loader */}
        <Toaster />
        <NextTopLoader color="#fff" showSpinner={false} />
        <GoogleProvider>
        <ReduxProvider>
          <div className="relative min-h-screen flex flex-col overflow-hidden">
            {/* Decorative Billboard-inspired Backgrounds */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            {/* Navbar */}
            <Navbar />

            {/* Optional AdSense Banner
            <div className="my-4 flex justify-center">
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXX"
                data-ad-slot="1234567890"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
              <Script id="adsense-init" strategy="afterInteractive">
                {`(adsbygoogle = window.adsbygoogle || []).push({});`}
              </Script>
            </div> */}

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Global Audio Player (always pinned bottom) */}
            <GlobalAudioPlayer />

            {/* Footer */}
            <Footer />
          </div>
        </ReduxProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
