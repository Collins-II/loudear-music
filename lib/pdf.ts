import PDFDocument from "pdfkit";

export function generateLicensePDF({
  email,
  beatId,
  licenseId,
  purchaseDate,
}: {
  email: string;
  beatId: string;
  licenseId: string;
  purchaseDate: string;
}): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.fontSize(20).text("Beat License Certificate", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Licensed To: ${email}`);
    doc.text(`Beat ID: ${beatId}`);
    doc.text(`License Type: ${licenseId}`);
    doc.text(`Purchase Date: ${purchaseDate}`);
    doc.moveDown();

    doc.text("Thank you for purchasing a license. Please retain this PDF as proof.");

    doc.end();

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
