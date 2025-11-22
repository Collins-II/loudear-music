// /app/api/cart/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const BASE_URL = process.env.NEXT_BASE_URL || "http://localhost:3000";

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is missing." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
  });

  try {
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No items received." },
        { status: 400 }
      );
    }

    // Convert cart items → Stripe line_items
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: item.currency,
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          metadata: {
            beatId: item.beatId ?? "",
            licenseId: item.licenseId ?? "",
          },
        },
        unit_amount: Math.round(item.price * 100), // convert to cents
      },
      quantity: item.quantity || 1,
    }));

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${BASE_URL}/purchase-done?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/purchase-cancelled`,
    });

    // ⭐ IMPORTANT FOR YOUR FRONTEND — RETURN THE REDIRECT URL
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
