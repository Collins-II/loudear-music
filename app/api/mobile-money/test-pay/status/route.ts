// app/api/mobile-money/status/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Transaction from "@/lib/database/models/transactions";

// GET handler - polling
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const txId = searchParams.get("txId");

  if (!txId) {
    return NextResponse.json(
      { success: false, error: "txId required" },
      { status: 400 }
    );
  }

  return handleStatusCheck(txId);
}

// POST handler
export async function POST(req: Request) {
  const { txId } = await req.json();

  if (!txId) {
    return NextResponse.json(
      { success: false, error: "txId required" },
      { status: 400 }
    );
  }

  return handleStatusCheck(txId);
}

// Shared logic
async function handleStatusCheck(txId: string) {
  try {
    await connectToDatabase();

    const tx = await Transaction.findById(txId);

    if (!tx) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Mock provider polling
    const providerStatus = Math.random() > 0.4 ? "SUCCESS" : "PENDING";

    if (providerStatus === "SUCCESS" && tx.status !== "completed") {
      tx.status = "completed";

      if (!tx.mobileMoney) {
        tx.mobileMoney = { verified: true } as any;
      } else {
        tx.mobileMoney.verified = true;
      }

      await tx.save();
    }

    return NextResponse.json({
      success: true,
      transactionId: tx._id,
      provider: tx.mobileMoney?.provider ?? null,
      providerReference: tx.mobileMoney?.externalTransactionId ?? null,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status, // pending | completed | failed
    });
  } catch (err) {
    console.log("STATUS ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Status lookup failed" },
      { status: 500 }
    );
  }
}
