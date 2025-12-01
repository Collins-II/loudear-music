// app/api/wallet/payout/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { getCurrentUser } from "@/actions/getCurrentUser";
import Transaction from "@/lib/database/models/transactions";
import User from "@/lib/database/models/user";
import mongoose from "mongoose";
import { mobileMoneyDisburse } from "@/lib/services/mobileMoneyDisburse";


export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const user = await getCurrentUser();
    if (!user?._id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { provider, phone, amount, currency = "ZMW", idempotencyKey } = body;

    if (!provider || !phone || !amount || amount <= 0) {
      return NextResponse.json({ error: "provider, phone, amount required" }, { status: 400 });
    }

    // reload user fresh
    const UserModel = User;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const freshUser = await UserModel.findById(user._id).session(session);

if (!freshUser) {
  await session.abortTransaction();
  session.endSession();
  return NextResponse.json(
    { error: "User not found" },
    { status: 404 }
  );
}

// ensure wallet object
if (!freshUser.wallet) {
  freshUser.wallet = { balance: 0 };
}

const balance = Number(freshUser.wallet.balance);

// check balance
if (balance < amount) {
  await session.abortTransaction();
  session.endSession();
  return NextResponse.json(
    { error: "Insufficient wallet balance" },
    { status: 400 }
  );
}

// idempotency
if (idempotencyKey) {
  const existing = await Transaction.findOne({
    "metadata.idempotencyKey": idempotencyKey,
    user: user._id
  }).session(session);

  if (existing) {
    await session.commitTransaction();
    session.endSession();
    return NextResponse.json({
      status: "duplicate",
      transaction: existing
    });
  }
}

// create payout tx
const [tx] = await Transaction.create([
  {
    user: user._id,
    type: "payout",
    amount,
    currency,
    status: "pending",
    paymentMethod: "mobile_money",
    description: `Payout to ${phone}`,
    mobileMoney: {
      provider,
      phoneNumber: phone,
      verified: false,
      internalReference: null,
      externalTransactionId: null,
      rawResponse: null
    },
    metadata: { idempotencyKey }
  }
], { session });

// deduct balance
freshUser.wallet.balance = balance - amount;
await freshUser.save({ session });

      // commit DB pre-disburse (we will update tx after external API)
      await session.commitTransaction();
      session.endSession();

      // call provider to disburse funds (outside DB session)
      const resp = await mobileMoneyDisburse(provider.toString(), phone, amount, currency);
      const success = resp.success;

      // update transaction with provider response and status
      await Transaction.findByIdAndUpdate(tx._id, {
        $set: {
          status: success ? "completed" : "failed",
          "mobileMoney.externalTransactionId": resp.providerRef,
          "mobileMoney.verified": success,
          "mobileMoney.rawResponse": resp.raw,
        },
      });

      return NextResponse.json({
        status: success ? "completed" : "failed",
        transactionId: tx._id as string,
        provider,
        providerReference: resp.providerRef,
      });
    } catch (errInner) {
      await session.abortTransaction();
      session.endSession();
      console.error("[PAYOUT_TX_ERROR]", errInner);
      return NextResponse.json({ error: "Payout failed" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("[PAYOUT_ERROR]", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
