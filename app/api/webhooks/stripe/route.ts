// /app/api/stripe/webhook/route.ts

import Beat from "@/lib/database/models/beat";
//import { generateLicensePDF } from "@/lib/pdf";
import { NextResponse } from "next/server";
import Stripe from "stripe";
//import { Resend } from "resend";

export const runtime = "nodejs";

// Stripe must use a stable API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

// Email service instance
//const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature)
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // 🔥 Successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_details?.email;
    if (!customerEmail) {
      console.error("❌ No customer email received!");
      return NextResponse.json({ received: true });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    for (const item of lineItems.data) {
      const price = item.price;
      const product = price?.product as Stripe.Product;

      // Metadata must be passed from the front-end Checkout session
      const beatId = product?.metadata?.beatId;
      const licenseId = product?.metadata?.licenseId;

      if (!beatId || !licenseId) {
        console.error("❌ Missing beatId or licenseId in metadata.", {
          beatId,
          licenseId,
        });
        continue;
      }

      // Fetch beat + producer
      const beat = await Beat.findById(beatId).populate({
        path: "producer",
        select: "stageName image email",
      });

      if (!beat) {
        console.error("❌ Beat not found for ID:", beatId);
        continue;
      }

      // Generate license PDF
     /* const pdfBuffer = await generateLicensePDF({
        email: customerEmail,
        beatId,
        licenseId,
        purchaseDate: new Date().toISOString(),
      });

      // Send email with beat & license attached
      /*try {
        await resend.emails.send({
          from: "LoudEar <noreply@yourdomain.com>",
          to: customerEmail,
          subject: `Your Beat License: ${beat.title}`,
          html: `
            <h2>Thank you for your purchase!</h2>
            <p>You purchased <strong>${beat.title}</strong>.</p>
            <p>Your beat & license PDF are attached.</p>
          `,
          attachments: [
            {
              filename: `License-${beat.title}.pdf`,
              content: pdfBuffer,
            },
            {
              filename: `${beat.title}.mp3`,
              path: beat.audioUrl, // 🔥 MUST be a valid CDN URL
            },
          ],
        });

        console.log("📧 Email sent to:", customerEmail);
      } catch (mailErr) {
        console.error("❌ Failed to send email:", mailErr);
      }*/
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
