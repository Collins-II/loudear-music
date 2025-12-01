// app/api/wallet/topup/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { getCurrentUser } from "@/actions/getCurrentUser";
import Transaction from "@/lib/database/models/transactions";
import crypto from "crypto";
import User from "@/lib/database/models/user";

/**
 * Body:
 * {
 *   method: "mobile_money" | "card",
 *   provider?: "MTN" | "Airtel",
 *   phone?: string,
 *   amount: number,   // decimal amount (e.g. 10.5)
 *   currency?: string,
 *   idempotencyKey?: string
 * }
 */

// Simple provider config (sandbox) — replace with real in production
const PROVIDER_CONFIG: any = {
  MTN: {
    endpoint: process.env.MTN_COLLECTION_URL,
    subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY,
  },
  AIRTEL: {
    endpoint: process.env.AIRTEL_COLLECTION_URL,
    apiKey: process.env.AIRTEL_API_KEY,
  },
};

async function mobileMoneyInitiate(provider: string, phone: string, amount: number, currency = "ZMW", idempotencyKey?: string) {
  // NOTE: this is a sandbox/generic implementation and must be adapted per provider docs.
  const reference = crypto.randomUUID();
  if (provider === "MTN") {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": PROVIDER_CONFIG.MTN.subscriptionKey ?? "",
      "X-Reference-Id": reference,
    };
    if (idempotencyKey) headers["X-Idempotency-Key"] = idempotencyKey;

    const payload = {
      amount: String(amount),
      currency,
      externalId: reference,
      payer: { partyIdType: "MSISDN", partyId: phone },
      payerMessage: "Wallet topup",
      payeeNote: "LoudEar wallet topup",
    };

    const res = await fetch(PROVIDER_CONFIG.MTN.endpoint ?? "", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const status = res.status;
    let data: any = {};
    try { data = await res.json(); } catch {}
    return { status, providerReference: reference, data };
  }

  if (provider === "AIRTEL") {
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${PROVIDER_CONFIG.AIRTEL.apiKey ?? ""}` };
    const ref = reference;
    const payload = { amount: String(amount), currency, mobile: phone, externalId: ref, reason: "Wallet topup" };

    const res = await fetch(PROVIDER_CONFIG.AIRTEL.endpoint ?? "", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const status = res.status;
    let data: any = {};
    try { data = await res.json(); } catch {}
    return { status, providerReference: ref, data };
  }

  throw new Error("Unsupported provider");
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const user = await getCurrentUser();
    if (!user?._id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { method, provider, phone, amount, currency = "ZMW", idempotencyKey } = body;

    if (!method || !amount || amount <= 0) {
      return NextResponse.json({ error: "method and positive amount required" }, { status: 400 });
    }

    // idempotency protection: if idempotencyKey set, return existing tx
    if (idempotencyKey) {
      const existing = await Transaction.findOne({ "metadata.idempotencyKey": idempotencyKey, user: user._id });
      if (existing) {
        return NextResponse.json({ status: "duplicate", transaction: existing });
      }
    }

    // create a pending transaction
    const tx = await Transaction.create({
      user: user._id,
      type: "wallet_topup",
      amount,
      currency,
      status: "pending",
      paymentMethod: method === "card" ? "stripe" : "mobile_money",
      description: `Wallet topup via ${method}`,
      mobileMoney: method === "mobile_money" ? { provider: provider ?? null, phoneNumber: phone ?? null, internalReference: null, verified: false, mode: "sandbox", rawResponse: null } : undefined,
      metadata: { idempotencyKey },
    });

     // In production: wait for provider webhook callback before crediting.

    // credit user wallet
    const userDoc = await User.findById(user._id);
    if (!userDoc) return NextResponse.json({ error: "User not found" }, { status: 404 });

    userDoc.wallet = userDoc.wallet || { balance: 0, currency: body.currency ?? "ZMW" };
    userDoc.wallet.balance = Number(userDoc.wallet.balance ?? 0) + Number(body.amount);
    userDoc.wallet.history = userDoc.wallet.history || [];
    userDoc.wallet.history.unshift(tx._id as any); // add reference
    await userDoc.save();


    // For card flow: return a redirect/checkout URL (you should integrate your payment gateway)
    if (method === "card") {
      // stub response: in real code you'd create a PaymentIntent / CheckoutSession and attach tx._id
      const checkoutUrl = `/checkout?tx=${tx._id}`; // replace with real
      await Transaction.findByIdAndUpdate(tx._id, { $set: { "stripe.rawResponse": { checkoutUrl } } });
      return NextResponse.json({ status: "redirect", method: "card", checkoutUrl, transactionId: tx._id });
    }

    // For mobile_money flow: call provider initiate & persist providerReference + rawResponse
    if (method === "mobile_money") {
      if (!provider || !phone) return NextResponse.json({ error: "provider and phone required for mobile_money" }, { status: 400 });
      const prov = provider.toString().toUpperCase();
      const resp = await mobileMoneyInitiate(prov, phone, amount, currency, idempotencyKey);

      const success = resp.status >= 200 && resp.status < 300 || resp.status === 202;
      await Transaction.findByIdAndUpdate(tx._id, {
        $set: {
          status: success ? "processing" : "failed",
          "mobileMoney.externalTransactionId": resp.providerReference,
          "mobileMoney.internalReference": tx._id,
          "mobileMoney.rawResponse": resp.data,
        },
      });

      return NextResponse.json({
        status: success ? "processing" : "failed",
        transactionId: tx._id,
        provider: prov,
        providerReference: resp.providerReference,
        providerStatusCode: resp.status,
        providerData: resp.data,
      });
    }

    return NextResponse.json({ error: "Unsupported topup method" }, { status: 400 });

  } catch (err: any) {
    console.error("[WALLET_TOPUP_ERROR]", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
