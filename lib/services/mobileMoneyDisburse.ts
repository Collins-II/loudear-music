import crypto from "crypto";

const PROVIDER_CONFIG = {
  MTN: {
    baseUrl: process.env.MTN_BASE_URL!,                      // e.g. https://proxy.momoapi.mtn.com
    collectionUrl: process.env.MTN_COLLECTION_URL!,
    disburseUrl: process.env.MTN_DISBURSE_URL!,
    subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY!,
    apiUser: process.env.MTN_API_USER!,
    apiKey: process.env.MTN_API_KEY!,
  },

  AIRTEL: {
    baseUrl: process.env.AIRTEL_BASE_URL!,                   // e.g. https://openapi.airtel.africa
    disburseUrl: process.env.AIRTEL_DISBURSE_URL!,
    clientId: process.env.AIRTEL_CLIENT_ID!,
    clientSecret: process.env.AIRTEL_CLIENT_SECRET!,
  },
};

/* ----------------------------------------------------
   MTN: Generate Access Token
---------------------------------------------------- */
async function getMtnToken() {
  const url = `${PROVIDER_CONFIG.MTN.baseUrl}/collection/token/`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": PROVIDER_CONFIG.MTN.subscriptionKey,
      Authorization:
        "Basic " +
        Buffer.from(
          `${PROVIDER_CONFIG.MTN.apiUser}:${PROVIDER_CONFIG.MTN.apiKey}`
        ).toString("base64"),
    },
  });

  if (!res.ok) {
    throw new Error(`MTN OAuth failed: ${res.status}`);
  }

  return res.json() as Promise<{ access_token: string; token_type: string }>;
}

/* ----------------------------------------------------
   MTN: Disburse Payment
---------------------------------------------------- */
async function disburseMTN(phone: string, amount: number, currency = "ZMW") {
  const refId = crypto.randomUUID();
  const token = await getMtnToken();

  const payload = {
    amount: String(amount),
    currency,
    externalId: refId,
    payee: { partyIdType: "MSISDN", partyId: phone },
    payerMessage: "LoudEar Payout",
    payeeNote: "Payout",
  };

  const res = await fetch(PROVIDER_CONFIG.MTN.disburseUrl, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": PROVIDER_CONFIG.MTN.subscriptionKey,
      Authorization: `${token.token_type} ${token.access_token}`,
      "X-Reference-Id": refId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await res.text().catch(() => "");

  return {
    success: res.status === 202,
    providerRef: refId,
    raw,
  };
}

/* ----------------------------------------------------
   Airtel: Obtain Access Token
---------------------------------------------------- */
async function getAirtelToken() {
  const res = await fetch(
    `${PROVIDER_CONFIG.AIRTEL.baseUrl}/auth/oauth2/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: PROVIDER_CONFIG.AIRTEL.clientId,
        client_secret: PROVIDER_CONFIG.AIRTEL.clientSecret,
        grant_type: "client_credentials",
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Airtel OAuth failed: ${res.status}`);
  }

  return res.json() as Promise<{ token_type: string; access_token: string }>;
}

/* ----------------------------------------------------
   Airtel: Disbursement
---------------------------------------------------- */
async function disburseAirtel(phone: string, amount: number, currency = "ZMW") {
  const token = await getAirtelToken();
  const refId = crypto.randomUUID();

  const payload = {
    reference: refId,
    subscriber: { country: "ZM", currency, msisdn: phone },
    transaction: { amount, id: refId },
  };

  const res = await fetch(PROVIDER_CONFIG.AIRTEL.disburseUrl, {
    method: "POST",
    headers: {
      Authorization: `${token.token_type} ${token.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await res.json().catch(() => ({}));

  const success =
    raw?.status?.code === "200" ||
    raw?.data?.transaction?.status === "SUCCESSFUL";

  return {
    success,
    providerRef: refId,
    raw,
  };
}

/* ----------------------------------------------------
   Unified Service Wrapper
---------------------------------------------------- */
export async function mobileMoneyDisburse(
  provider: "MTN" | "AIRTEL",
  phone: string,
  amount: number,
  currency = "ZMW"
) {
  switch (provider) {
    case "MTN":
      return await disburseMTN(phone, amount, currency);

    case "AIRTEL":
      return await disburseAirtel(phone, amount, currency);

    default:
      throw new Error("Unsupported provider");
  }
}
