import { connectToDatabase } from "@/lib/database";
import Transaction from "@/lib/database/models/transactions";
import { NextResponse } from "next/server";

interface StatusInput {
  providerReference: string; // provider’s reference ID
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = (await req.json()) as StatusInput;

    const tx = await Transaction.findOne({
      "mobileMoney.externalTransactionId": body.providerReference,
    });

    if (!tx) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    const provider = tx.mobileMoney?.provider;

    // Simulated Sandbox Polling
    let providerStatus = "PENDING";

    if (Math.random() > 0.7) providerStatus = "SUCCESS";

    if (providerStatus === "SUCCESS" && tx.status !== "completed") {
      tx.status = "completed";
      tx.mobileMoney!.verified = true;
      await tx.save();
    }

    return NextResponse.json({
      success: true,
      transactionId: tx._id , // internal DB ID
      providerReference: tx.mobileMoney?.externalTransactionId, // provider ID
      provider,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status, // pending | processing | completed | failed
    });
  } catch (err) {
    console.error("MOBILE-MONEY-STATUS ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Status check failed" },
      { status: 500 }
    );
  }
}
