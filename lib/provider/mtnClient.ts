// lib/providers/mtnClient.ts
import axios from "axios";

const MTN_OAUTH_URL = process.env.MTN_OAUTH_URL || "https://sandbox.momodeveloper.mtn.com/collection/token/"; // example
const MTN_COLLECTION_URL = process.env.MTN_COLLECTION_URL || "https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay";

const MTN_SUBSCRIPTION_KEY = process.env.MTN_SUBSCRIPTION_KEY!;
const MTN_API_KEY = process.env.MTN_API_KEY!; // client secret / api key
const MTN_API_USER = process.env.MTN_API_USER!; // client id
// In production you'll use the exact credentials provided by MTN per country.

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30000) return cachedToken.token;

  // Example: some MTN flows require Basic auth with client credentials
  const res = await axios.post(
    MTN_OAUTH_URL,
    "grant_type=client_credentials",
    {
      headers: {
        "Ocp-Apim-Subscription-Key": MTN_SUBSCRIPTION_KEY,
        Authorization: `Basic ${Buffer.from(`${MTN_API_USER}:${MTN_API_KEY}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const token = res.data.access_token;
  const expiresIn = res.data.expires_in || 3600;
  cachedToken = { token, expiresAt: Date.now() + expiresIn * 1000 };
  return token;
}

/**
 * Initiate an MTN Request To Pay (RTP) transaction.
 * Returns providerTxnId (UUID) and status (pending).
 */
export async function initiateMtnPayment({
  amount,
  currency,
  externalId,
  payerMsisdn,
  payerMessage = "Payment",
  payeeNote = "LoudEar payment",
}: {
  amount: number;
  currency: string;
  externalId: string; // your internal payment.reference
  payerMsisdn: string; // normalized e.g. +260XXXXXXXX
  payerMessage?: string;
  payeeNote?: string;
}) {
  const token = await getAccessToken();

  const body = {
    amount: String(amount.toFixed(2)),
    currency,
    externalId,
    payer: { partyIdType: "MSISDN", partyId: payerMsisdn },
    payerMessage,
    payeeNote,
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    "X-Reference-Id": externalId, // unique
    "X-Target-Environment": process.env.MTN_ENV || "sandbox",
    "Ocp-Apim-Subscription-Key": MTN_SUBSCRIPTION_KEY,
    "Content-Type": "application/json",
  };

  const resp = await axios.post(MTN_COLLECTION_URL, body, { headers, validateStatus: () => true });

  // handle responses (201 created or 202 etc.)
  if (resp.status === 201 || resp.status === 202) {
    // MTN returns 202 with no body for some flows; use externalId as provider ref
    const providerTxnId = resp.headers["x-reference-id"] ?? externalId;
    return { providerTxnId, status: "pending", raw: resp.data, statusCode: resp.status };
  } else {
    throw new Error(`MTN initiation failed: ${resp.status} ${JSON.stringify(resp.data)}`);
  }
}

/** verify webhook signature if MTN provides signature header - adapt as provider requires */
export function verifyMtnWebhook(reqBody: any, headers: Record<string,string>) {
  console.log(reqBody, headers)
  // MTN's webhook security varies; in many cases you must check the subscription key or an HMAC.
  // Placeholder: always true — replace with actual verification using certificate or header check.
  return true;
}
