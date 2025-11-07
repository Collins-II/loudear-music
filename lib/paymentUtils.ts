// lib/paymentUtils.ts
import { CountryCode, isPossiblePhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";

export function normalizePhone(phone: string, country?: string): string {
  try {
    const p = parsePhoneNumberFromString(phone, country as CountryCode);
    if (!p) return phone;
    return p.formatInternational(); // e.g. +260 96 012 3456
  } catch {
    return phone;
  }
}

export function validatePhone(phone: string, country?: string): boolean {
  try {
    return isPossiblePhoneNumber(phone, country as CountryCode);
  } catch {
    return false;
  }
}

/** simple idempotency key helper */
export function idempotencyKeyFor(body: any) {
  // e.g. use sender+receiver+amount+channel+timestamp-day to avoid duplicates per-day
  const key = `${body.sender ?? "anon"}|${body.receiver ?? "plat"}|${body.amount}|${body.channel}|${body.phoneNumber ?? ""}`;
  return Buffer.from(key).toString("base64");
}
