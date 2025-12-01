import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Transaction from "@/lib/database/models/transactions";
import { MobileMoneyService } from "@/lib/services/mobileMoneyService";
import { getCurrentUser } from "@/actions/getCurrentUser";

export async function POST(req: Request) {
  await connectToDatabase();

  const body = await req.json();
  const provider = body.provider?.toString().trim().toUpperCase() === "AIRTEL"
    ? "Airtel"
    : "MTN";

  if (!body.phone || !body.amount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await getCurrentUser();

  // ------------------ IDEMPOTENCY ------------------
  if (body.idempotencyKey) {
    const existing = await Transaction.findOne({
      "metadata.idempotencyKey": body.idempotencyKey,
    });

    if (existing) {
      return NextResponse.json({
        status: "duplicate",
        transactionId: existing._id,
        provider: existing.mobileMoney?.provider,
        providerReference: existing.mobileMoney?.externalTransactionId,
      });
    }
  }

  // ------------------ CREATE PENDING ------------------
  const tx = await Transaction.create({
    user: user?._id,
    amount: body.amount,
    currency: body.currency ?? "ZMW",
    status: "pending",
    type: "purchase",
    description: body.purpose ?? "LoudEar Payment",
    paymentMethod: "mobile_money",

    mobileMoney: {
      provider,
      phoneNumber: body.phone,
      verified: false,
      externalTransactionId: null,
      rawResponse: null,
    },

    metadata: {
      reference: body.reference,
      idempotencyKey: body.idempotencyKey,
      ...body.metadata,
    },
  });

  // ------------------ CALL PROVIDER ------------------
  const providerResp = await MobileMoneyService.initiatePayment({
    provider,
    phone: body.phone,
    amount: body.amount,
    currency: body.currency,
    purpose: body.purpose,
    reference: body.reference,
  });

  // ------------------ UPDATE STATUS ------------------
  await Transaction.findByIdAndUpdate(tx._id, {
    $set: {
      status: providerResp.ok ? "processing" : "failed",
      "mobileMoney.externalTransactionId": providerResp.providerReference,
      "mobileMoney.rawResponse": providerResp.raw,
    },
  });

  return NextResponse.json({
    status: providerResp.ok ? "processing" : "failed",
    provider,
    transactionId: tx._id, // ALWAYS internal transaction ID
    providerReference: providerResp.providerReference, // ALWAYS provider transaction ref
    providerStatusCode: providerResp.status,
  });
}
