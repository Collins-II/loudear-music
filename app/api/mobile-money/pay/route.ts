import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import crypto from "crypto";
import Transaction from "@/lib/database/models/transactions";
import { getCurrentUser } from "@/actions/getCurrentUser";

type Provider = "MTN" | "Airtel";

interface InitiateBody {
  provider: string;
  phone: string;
  amount: number;
  currency?: string;
  purpose?: string;
  reference?: string;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

const PROVIDER_CONFIG = {
  MTN: {
    endpoint:
      process.env.MTN_COLLECTION_URL ??
      "https://sandbox.mtn.com/collection/v1_0/requesttopay",
    subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY,
  },
  Airtel: {
    endpoint:
      process.env.AIRTEL_SANDBOX_INITIATE_URL ??
      "https://sandbox.airtel.com/mpesa/transactions",
    apiKey: process.env.AIRTEL_API_KEY,
  },
};

// --------------------------- Create Pending TX ----------------------------
async function createPendingRecord(body: InitiateBody, provider: Provider) {
  const user = await getCurrentUser();

  return await Transaction.create({
    user: user?._id,
    amount: body.amount,
    currency: body.currency ?? "ZMW",
    status: "pending",
    type: "purchase",
    paymentMethod: "mobile_money",

    description: body.purpose ?? "LoudEar Payment",

    mobileMoney: {
      provider,
      phoneNumber: body.phone,
      verified: false,
      externalTransactionId: null, // FIXED
      rawResponse: null,
    },

    metadata: {
      ...body.metadata,
      reference: body.reference,
      idempotencyKey: body.idempotencyKey,
    },
  });
}

// ----------------------------- MTN ------------------------------
async function callMTN(body: InitiateBody) {
  const providerRef = body.reference || crypto.randomUUID();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": PROVIDER_CONFIG.MTN.subscriptionKey ?? "",
    "X-Reference-Id": providerRef,
  };

  if (body.idempotencyKey) {
    headers["X-Idempotency-Key"] = body.idempotencyKey;
  }

  const payload = {
    amount: String(body.amount),
    currency: body.currency || "ZMW",
    externalId: providerRef,
    payer: {
      partyIdType: "MSISDN",
      partyId: body.phone,
    },
    payerMessage: body.purpose || "LoudEar Payment",
    payeeNote: body.purpose || "Payment",
  };

  const res = await fetch(PROVIDER_CONFIG.MTN.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  let json = {};
  try {
    json = await res.json();
  } catch {}

  return {
    status: res.status,
    data: json,
    providerRef,
  };
}

// ----------------------------- Airtel ------------------------------
async function callAirtel(body: InitiateBody) {
  const providerRef = body.reference || crypto.randomUUID();

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${PROVIDER_CONFIG.Airtel.apiKey}`,
  };

  const payload = {
    amount: String(body.amount),
    currency: body.currency || "ZMW",
    mobile: body.phone,
    externalId: providerRef,
    reason: body.purpose || "LoudEar Payment",
  };

  const res = await fetch(PROVIDER_CONFIG.Airtel.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  let json = {};
  try {
    json = await res.json();
  } catch {}

  return {
    status: res.status,
    data: json,
    providerRef,
  };
}

// ----------------------------- MAIN HANDLER ------------------------------
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body: InitiateBody = await req.json();

    if (!body.provider || !body.phone || !body.amount) {
      return NextResponse.json(
        { error: "provider, phone, amount are required" },
        { status: 400 }
      );
    }

    // Normalize provider
    const rawProvider = body.provider.trim().toUpperCase();
    const provider: Provider = rawProvider === "AIRTEL" ? "Airtel" : "MTN";

    // Idempotency
    if (body.idempotencyKey) {
      const existing = await Transaction.findOne({
        "metadata.idempotencyKey": body.idempotencyKey,
      });

      if (existing) {
        return NextResponse.json({
          status: existing.status,
          provider: existing.mobileMoney?.provider,
          transactionId: existing._id ,
          providerReference: existing.mobileMoney?.externalTransactionId,
        });
      }
    }

    // Create Pending Record
    const tx = await createPendingRecord(body, provider);

    // Call provider
    const providerResp =
      provider === "MTN" ? await callMTN(body) : await callAirtel(body);

    const success = providerResp.status >= 200 && providerResp.status < 300;

    await Transaction.findByIdAndUpdate(tx._id, {
      $set: {
        status: success ? "processing" : "failed",
        "mobileMoney.externalTransactionId": providerResp.providerRef, // FIXED
        "mobileMoney.rawResponse": providerResp.data,
      },
    });

    return NextResponse.json({
      status: success ? "processing" : "failed",
      provider,
      transactionId: tx._id , // Internal
      providerReference: providerResp.providerRef, // Provider
      providerStatusCode: providerResp.status,
    });
  } catch (err: any) {
    console.error("MOBILE MONEY INIT ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Mobile money initiation failed" },
      { status: 500 }
    );
  }
}
