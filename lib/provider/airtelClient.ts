// lib/providers/airtelClient.ts
import axios from "axios";

const AIRTEL_BASE = process.env.AIRTEL_BASE_URL || "https://openapiuat.airtel.africa"; // example
const AIRTEL_API_KEY = process.env.AIRTEL_API_KEY!;
//const AIRTEL_SECRET = process.env.AIRTEL_SECRET!;

export async function initiateAirtelPayment({
  amount,
  currency,
  externalId,
  msisdn,
  payerMessage = "Payment",
}: {
  amount: number;
  currency: string;
  externalId: string;
  msisdn: string;
  payerMessage?: string;
}) {
  // Airtel's exact flow differs per region. Example for demo:
  const url = `${AIRTEL_BASE}/payments/v1/cashouts`;
  const body = {
    amount: String(amount),
    currency,
    externalId,
    partyId: msisdn,
    payerMessage,
  };

  const headers = {
    "X-API-KEY": AIRTEL_API_KEY,
    "Content-Type": "application/json",
  };

  const resp = await axios.post(url, body, { headers, validateStatus: () => true });
  if (resp.status === 200 || resp.status === 202) {
    const providerTxnId = resp.data.transactionId ?? externalId;
    return { providerTxnId, status: "pending", raw: resp.data, statusCode: resp.status };
  }
  throw new Error(`Airtel initiation failed: ${resp.status} ${JSON.stringify(resp.data)}`);
}

export function verifyAirtelWebhook(body: any, headers: Record<string,string>) {
  console.log(body, headers)
  // Implement HMAC or header check per Airtel docs.
  return true;
}
