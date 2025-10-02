"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DownloadCloud } from "lucide-react";
import { SongSerialized } from "@/actions/getSongById";

interface DownloadModalProps {
  data: SongSerialized;
  open: boolean;
  onClose: () => void;
  fileUrl?: string;
  onConfirmDownload: () => void;
}

export default function DownloadModal({
  data,
  open,
  onClose,
  onConfirmDownload,
}: DownloadModalProps) {
   const safeFilename = (name: string) =>
    name.replace(/[<>:"/\\|?*]+/g, "").trim();

  const downloadFileName = `${safeFilename(
    data.artist
  )} - ${safeFilename(data.title)}.mp3`;

  const handleDownload = async () => {
    try {
      const response = await fetch(data.fileUrl);
      if (!response.ok) throw new Error("Failed to fetch audio file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
      onConfirmDownload()
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black">
            <DownloadCloud className="w-5 h-5 text-blue-600" />
            Download this Song
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <p className="text-gray-600 text-sm">
            Do you want to download <strong>this song</strong> to your device?
          </p>
          <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleDownload}>
            Download Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
