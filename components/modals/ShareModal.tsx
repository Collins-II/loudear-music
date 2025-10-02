"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Facebook, Twitter, Share2, MessageCircle } from "lucide-react";
import { useState } from "react";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
}

export default function ShareModal({ open, onClose, shareUrl, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5" />,
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Twitter",
      icon: <Twitter className="w-5 h-5" />,
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl
      )}&text=${encodeURIComponent(title)}`,
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5" />,
      link: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + shareUrl)}`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-md text-black/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black">
            <Share2 className="w-5 h-5 text-pink-600" />
            Share this Song
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          {shareOptions.map((opt) => (
            <a
              key={opt.name}
              href={opt.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg border text-black/90 bg-gray-50 hover:bg-gray-100 transition"
            >
              {opt.icon}
              <span>{opt.name}</span>
            </a>
          ))}

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
