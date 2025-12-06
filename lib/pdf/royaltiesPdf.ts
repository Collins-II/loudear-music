import PDFDocument from "pdfkit";
import { Readable } from "stream";

export function generateRoyaltyPDF({ songs }: any) {
  const doc = new PDFDocument({ margin: 50 });

  // Convert to a readable stream so Next.js can return it
  const stream = new Readable({
    read() {}
  });

  doc.on("data", (chunk) => stream.push(chunk));
  doc.on("end", () => stream.push(null));

  doc.fontSize(22).font("Helvetica-Bold");
  doc.text("Royalty Split Report", { align: "left" });
  doc.moveDown();

  doc.fontSize(12).font("Helvetica");
  doc.text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown(2);

  for (const track of songs) {
    if (!track) continue;

    doc.fontSize(16).font("Helvetica-Bold");
    doc.text(track.title);
    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica");
    doc.text(`Allocated: ${track.allocatedPercent}%`);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").text("Splits:");
    doc.moveDown(0.5);

    // TABLE HEADER
    doc.font("Helvetica-Bold");
    doc.text("Collaborator", { continued: true, width: 200 });
    doc.text("Percent", { continued: true, width: 100 });
    doc.text("Destination", { width: 200 });
    doc.moveDown(0.5);

    doc.font("Helvetica");

    for (const s of track.splits) {
      doc.text(s.collaboratorName, { continued: true, width: 200 });
      doc.text(`${s.percent}%`, { continued: true, width: 100 });
      doc.text(s.destination || s.collaboratorEmail || "Not set", {
        width: 200,
      });
      doc.moveDown(0.3);

      if (doc.y > 700) {
        doc.addPage();
      }
    }

    doc.moveDown(1.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#cccccc");
    doc.moveDown(1.5);

    if (doc.y > 700) doc.addPage();
  }

  doc.end();
  return stream;
}
