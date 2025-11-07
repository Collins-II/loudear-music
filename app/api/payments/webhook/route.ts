// app/api/payments/webhook/route.ts
import { connectToDatabase } from "@/lib/database";
import { Payment } from "@/lib/database/models/payment";
import { verifyAirtelWebhook } from "@/lib/provider/airtelClient";
import { verifyMtnWebhook } from "@/lib/provider/mtnClient";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const headers = Object.fromEntries(req.headers.entries());
    const body = await req.json();

    // Determine provider (you can use a header or webhook path to separate providers)
    const provider = headers["x-provider"] || headers["x-mtn-signature"] ? "mtn" : headers["x-airtel-signature"] ? "airtel" : "unknown";

    // Basic verification
    let verified = false;
    if (provider === "mtn") verified = verifyMtnWebhook(body, headers);
    else if (provider === "airtel") verified = verifyAirtelWebhook(body, headers);
    else {
      // If you can't determine provider, optionally check both or reject
      verified = true; // or set false
    }

    if (!verified) return NextResponse.json({ error: "Webhook verification failed" }, { status: 401 });

    // Example MTN webhook payload might contain externalId or reference and status
    // Normalize to find matching Payment
    const externalId = body.externalId || body.reference || body.transactionId || body.x_reference_id || body.id;
    if (!externalId) {
      console.warn("Webhook missing transaction id", body);
      return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
    }

    const payment = await Payment.findOne({ reference: externalId }) || await Payment.findOne({ providerTxnId: externalId });
    if (!payment) {
      console.warn("Payment not found for external id", externalId);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Extract status from webhook depending on provider payload
    let newStatus: any = "pending";
    if (body.status) {
      // many providers use status strings like "SUCCESSFUL", "PENDING", "FAILED"
      const s = String(body.status).toLowerCase();
      if (s.includes("success") || s.includes("successful") || s === "completed") newStatus = "success";
      else if (s.includes("fail") || s.includes("failed") || s.includes("cancel")) newStatus = "failed";
      else newStatus = "pending";
    } else if (body.transactionStatus) {
      // provider-specific key
      const s = String(body.transactionStatus).toLowerCase();
      if (s.includes("completed") || s.includes("success")) newStatus = "success";
      else if (s.includes("failed")) newStatus = "failed";
      else newStatus = "pending";
    }

    // update payment
    payment.status = newStatus;
    payment.metadata = { ...payment.metadata, webhookPayload: body, webhookHeaders: headers, webhookReceivedAt: new Date() };

    // If provider gives providerTxnId or external reference
    if (body.transactionId || body.providerTxnId) payment.providerTxnId = body.transactionId || body.providerTxnId;

    await payment.save();

    // Optionally emit via Socket.IO to front-end (global io)
    try {
      const io = (globalThis as any).io;
      io?.emit("paymentUpdate", { reference: payment.reference, status: payment.status, providerTxnId: payment.providerTxnId });
    } catch (e) {
      console.warn("Socket emit failed", e);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: err.message || "Webhook handler error" }, { status: 500 });
  }
}
