"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Play, FileText, Download } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { saveAs } from "file-saver";

export default function PressReleasePreview() {
  const [data, setData] = useState<any>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("pressReleaseData");
    if (stored) setData(JSON.parse(stored));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        No press release data found.
      </div>
    );
  }

  // ✅ Export as PDF
  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    const canvas = await html2canvas(contentRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${data.title || "press-release"}.pdf`);
  };

  // ✅ Export as DOCX
  const handleExportDocx = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: data.title,
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              text: data.tagline,
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: `Release Date: ${data.releaseDate}`,
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              text: "", // spacing
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: data.body.replace(/<[^>]+>/g, ""), // strip HTML tags
                  size: 24,
                }),
              ],
            }),
            new Paragraph({
              text: "", // spacing
            }),
            new Paragraph({
              text: "Links:",
              heading: HeadingLevel.HEADING_2,
            }),
            data.ctaMusic
              ? new Paragraph(`🎵 Music: ${data.ctaMusic}`)
              : new Paragraph(""),
            data.ctaVideo
              ? new Paragraph(`🎬 Video: ${data.ctaVideo}`)
              : new Paragraph(""),
            data.ctaEvent
              ? new Paragraph(`📅 Event: ${data.ctaEvent}`)
              : new Paragraph(""),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${data.title || "press-release"}.docx`);
  };

  return (
    <section className="relative w-full bg-background text-foreground">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={data.coverImage || "/assets/images/bizzy03.jpg"}
          alt="Cover"
          fill
          priority
          className="object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative mx-auto max-w-5xl min-h-screen px-6 py-24 flex flex-col items-center text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg"
        >
          {data.title}
        </motion.h1>

        <p className="mt-2 text-lg md:text-xl text-yellow-400 font-semibold">
          {data.tagline}
        </p>

        <p className="mt-1 text-sm text-white/70">
          Release Date: {data.releaseDate}
        </p>

        {/* Cover Image */}
        {data.coverImage && (
          <div className="relative w-full max-w-lg h-80 mt-8 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <Image
              src={data.coverImage}
              alt="Release Cover"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Body */}
        <div
          className="mt-10 max-w-3xl text-left text-white/90 prose prose-invert"
          dangerouslySetInnerHTML={{ __html: data.body }}
        />

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {data.ctaMusic && (
            <Link href={data.ctaMusic}>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 flex items-center gap-2">
                <Play className="w-5 h-5" /> Listen Now
              </Button>
            </Link>
          )}
          {data.ctaVideo && (
            <Link href={data.ctaVideo}>
              <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-3 flex items-center gap-2">
                <FaYoutube size={20} /> Watch Video
              </Button>
            </Link>
          )}
          {data.ctaEvent && (
            <Link href={data.ctaEvent}>
              <Button
                variant="outline"
                className="rounded-xl text-slate-900 hover:text-white bg-white hover:bg-slate-900 px-6 py-3 flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" /> Upcoming Event
              </Button>
            </Link>
          )}
        </div>

        {/* Export Buttons */}
        <div className="mt-12 flex gap-4">
          <Button
            onClick={handleExportPDF}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 flex items-center gap-2"
          >
            <FileText className="w-5 h-5" /> Export PDF
          </Button>
          <Button
            onClick={handleExportDocx}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 flex items-center gap-2"
          >
            <Download className="w-5 h-5" /> Export DOCX
          </Button>
        </div>
      </div>
    </section>
  );
}
