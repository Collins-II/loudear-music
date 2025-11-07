// app/api/payments/initiate/route.ts
import { NextResponse } from "next/server";
import { normalizePhone, validatePhone, idempotencyKeyFor } from "@/lib/paymentUtils";
import { connectToDatabase } from "@/lib/database";
import { Payment } from "@/lib/database/models/payment";
import { initiateMtnPayment } from "@/lib/provider/mtnClient";
import { initiateAirtelPayment } from "@/lib/provider/airtelClient";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const {
      sender,
      receiver,
      amount,
      currency = "ZMW",
      channel = "mobile_money",
      network,
      phoneNumber,
      country,
      description,
      idempotencyKey,
    } = body;

    if (!sender || !receiver || !amount || !phoneNumber || !country || !network) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // normalize phone
    const phone = normalizePhone(phoneNumber, country);
    if (!validatePhone(phone, country)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    // idempotency - try to reuse existing payment with same idempotencyKey
    const idKey = idempotencyKey ?? idempotencyKeyFor({ sender, receiver, amount, channel, phoneNumber: phone });
    const existing = await Payment.findOne({ "metadata.idempotencyKey": idKey });
    if (existing) {
      return NextResponse.json({ success: true, payment: existing, reused: true });
    }

    // create payment record (pending)
    const payment = await Payment.create({
      sender,
      receiver,
      amount,
      currency,
      channel,
      network,
      phoneNumber: phone,
      country,
      description,
      status: "pending",
      metadata: { idempotencyKey: idKey },
    });

    // provider call
    let providerResult;
    if (network.toLowerCase() === "mtn") {
      providerResult = await initiateMtnPayment({
        amount,
        currency,
        externalId: payment.reference,
        payerMsisdn: phone,
        payerMessage: description,
      });
    } else if (network.toLowerCase() === "airtel") {
      providerResult = await initiateAirtelPayment({
        amount,
        currency,
        externalId: payment.reference,
        msisdn: phone,
        payerMessage: description,
      });
    } else {
      // unsupported network
      payment.status = "failed";
      payment.metadata = { ...payment.metadata, error: "Unsupported network" };
      await payment.save();
      return NextResponse.json({ error: "Unsupported network" }, { status: 400 });
    }

    // store provider txn id
    payment.providerTxnId = providerResult.providerTxnId;
    payment.metadata = { ...payment.metadata, providerRaw: providerResult.raw };
    await payment.save();

    // respond with pending payment
    return NextResponse.json({ success: true, payment, provider: providerResult }, { status: 201 });
  } catch (err: any) {
    console.error("Initiate payment error:", err);
    return NextResponse.json({ error: err.message || "Failed to initiate payment" }, { status: 500 });
  }
}
