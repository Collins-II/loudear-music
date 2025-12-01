import crypto from "crypto";

type Provider = "MTN" | "Airtel";

export interface PayInitInput {
  provider: Provider;
  phone: string;
  amount: number;
  currency?: string;
  purpose?: string;
  reference?: string; // user-defined or auto
}

export interface ProviderResponse {
  ok: boolean;
  status: number;
  providerReference: string; // unique ref you need
  raw: any;
}

const CONFIG = {
  MTN: {
    endpoint: process.env.MTN_COLLECTION_URL ??
      "https://sandbox.mtn.com/collection/v1_0/requesttopay",
    subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY ?? "",
  },
  Airtel: {
    endpoint: process.env.AIRTEL_BASE_URL ??
      "https://sandbox.airtel.com/merchant/v1/payments",
    apiKey: process.env.AIRTEL_API_KEY ?? "",
  },
};

export class MobileMoneyService {
  static async initiatePayment(input: PayInitInput): Promise<ProviderResponse> {
    const provider = input.provider;
    if (provider === "MTN") return this.callMTN(input);
    return this.callAirtel(input);
  }

  // ---------------- MTN ----------------
  private static async callMTN(input: PayInitInput): Promise<ProviderResponse> {
    const providerReference = input.reference || crypto.randomUUID();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": CONFIG.MTN.subscriptionKey,
      "X-Reference-Id": providerReference,
    };

    const body = {
      amount: String(input.amount),
      currency: input.currency || "ZMW",
      externalId: providerReference,
      payer: {
        partyIdType: "MSISDN",
        partyId: input.phone,
      },
      payerMessage: input.purpose || "Payment",
      payeeNote: input.purpose || "Payment",
    };

    const res = await fetch(CONFIG.MTN.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    let json = {};
    try { json = await res.json(); } catch {}

    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      providerReference,
      raw: json,
    };
  }

  // ---------------- Airtel ----------------
  private static async callAirtel(input: PayInitInput): Promise<ProviderResponse> {
    const providerReference = input.reference || crypto.randomUUID();

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONFIG.Airtel.apiKey}`,
    };

    const body = {
      amount: String(input.amount),
      currency: input.currency || "ZMW",
      mobile: input.phone,
      externalId: providerReference,
      reason: input.purpose || "Payment",
    };

    const res = await fetch(CONFIG.Airtel.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    let json = {};
    try { json = await res.json(); } catch {}

    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      providerReference,
      raw: json,
    };
  }
}
