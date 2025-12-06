// app/api/mobile-money/pay/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { getCurrentUser } from "@/actions/getCurrentUser";

import Transaction from "@/lib/database/models/transactions";
import Topup from "@/lib/database/models/topup";
import User from "@/lib/database/models/user";
import RoyaltySplit from "@/lib/database/models/royalty-splits";

import { MobileMoneyService } from "@/lib/services/mobileMoneyService";
import { Types } from "mongoose";

const PLATFORM_FEE_PCT = Number(process.env.PLATFORM_FEE_PCT ?? "10"); // Default 10%

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const user = await getCurrentUser();

    if (!user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      provider: rawProvider,
      phone,
      amount,
      currency = "ZMW",
      idempotencyKey,
      metadata = {},
      artistId,
    } = body;

    if (!rawProvider || !phone || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "provider, phone and positive amount required" },
        { status: 400 }
      );
    }

    const provider = rawProvider.toString().trim().toUpperCase();

    // -----------------------------
    // 1. IDEMPOTENCY CHECK
    // -----------------------------
    if (idempotencyKey) {
      const existingTx = await Transaction.findOne({
        "metadata.idempotencyKey": idempotencyKey,
      }).lean();

      if (existingTx) {
        const existingTopup = await Topup.findOne({
          transactionId: existingTx._id,
        }).lean();

        return NextResponse.json({
          duplicate: true,
          status: existingTx.status,
          transaction: existingTx,
          topup: existingTopup,
        });
      }
    }

    // -----------------------------
    // 2. CREATE BASE TRANSACTION
    // -----------------------------
    const tx = await Transaction.create({
      user: user._id,
      type: "wallet_topup",
      amount: Number(amount),
      currency,
      status: "pending",
      paymentMethod: "mobile_money",
      description: `Mobile money topup by ${user._id}`,
      mobileMoney: {
        provider,
        phoneNumber: phone,
        verified: false,
        externalTransactionId: null,
        rawResponse: null,
      },
      metadata: { ...metadata, idempotencyKey },
    });

    // -----------------------------
    // 3. CREATE TOPUP RECORD
    // -----------------------------
    const topup = await Topup.create({
      user: user._id,
      amount: Number(amount),
      currency,
      provider,
      phoneNumber: phone,
      status: "pending",
      transactionId: tx._id,
      providerReference: null,
      rawResponse: null,
      metadata: { ...metadata, idempotencyKey },
    });

    // -----------------------------
    // 4. CALL PROVIDER
    // -----------------------------
    const provResp = await MobileMoneyService.initiatePayment({
      provider,
      phone,
      amount: Number(amount),
      currency,
      reference: metadata.reference,
    });
    console.log("PROVIDER_PAYLOAD", provResp)

    const providerAccepted = Boolean(true); /* provResp?.ok */
    const providerReference = provResp?.providerReference ?? null;
    const providerRaw = provResp?.raw ?? null;
    const providerStatusCode = provResp?.status ?? null;

    await Transaction.findByIdAndUpdate(tx._id, {
      $set: {
        status: providerAccepted ? "processing" : "failed",
        "mobileMoney.externalTransactionId": providerReference,
        "mobileMoney.rawResponse": providerRaw,
      },
    });

    await Topup.findByIdAndUpdate(topup._id, {
      $set: {
        status: providerAccepted ? "processing" : "failed",
        providerReference,
        rawResponse: providerRaw,
      },
    });

    if (!providerAccepted) {
      return NextResponse.json(
        {
          status: "failed",
          reason: providerRaw ?? "provider_rejected",
          provider,
          providerReference,
          providerStatusCode,
          transactionId: tx._id,
          topupId: topup._id,
        },
        { status: 200 }
      );
    }

    // =====================================================================
    // 5. PLATFORM FEE + DISTRIBUTABLE AMOUNT
    // =====================================================================
    const totalAmount = Number(amount);
    const computedPlatformFee = Number(
      ((totalAmount * PLATFORM_FEE_PCT) / 100).toFixed(2)
    );
    const distributable = Number((totalAmount - computedPlatformFee).toFixed(2));

    // Platform fee transaction
    await Transaction.create({
      user: null,
      type: "fee",
      amount: computedPlatformFee,
      currency,
      paymentMethod: "mobile_money",
      status: "settled",
      description: `Platform fee (${PLATFORM_FEE_PCT}%) for topup ${tx._id}`,
      metadata: {
        sourceTopup: tx._id,
        providerReference,
        platformFeePct: PLATFORM_FEE_PCT,
      },
    });

    const distribution: any[] = [];

    // =====================================================================
    // 6. ROYALTY SPLITS (FOR ALL MEDIA TYPES)
    // =====================================================================
    const mediaIdCandidate =
      metadata.mediaId ??
      metadata.songId ??
      metadata.beatId ??
      metadata.albumId ??
      metadata.videoId ??
      null;

    let splits: any[] = [];

    if (mediaIdCandidate) {
      try {
        const objId = Types.ObjectId.isValid(mediaIdCandidate)
          ? new Types.ObjectId(mediaIdCandidate)
          : mediaIdCandidate;

        splits = await RoyaltySplit.find({ songId: objId }).lean();
      } catch (err) {
        console.warn("royalty lookup error", err);
        splits = [];
      }
    }

    // -------------------------------
    // Fallback → 100% to owner/artist
    // -------------------------------
    if (splits.length === 0 && artistId) {
      const finalArtistId = Types.ObjectId.isValid(artistId)
        ? new Types.ObjectId(artistId)
        : artistId;

      splits = [
        {
          songId: mediaIdCandidate,
          collaboratorUserId: finalArtistId,
          ownerId: finalArtistId,
          percent: 100,
          collaboratorName: "Artist",
          verified: true,
        },
      ];
    }

    // -------------------------------
    // No splits + no artist = holding
    // -------------------------------
    if (splits.length === 0 && !artistId) {
      const holdingTx = await Transaction.create({
        user: null,
        type: "holding",
        amount: distributable,
        paymentMethod: "mobile_money",
        currency,
        status: "holding",
        description: `Undistributed revenue for media ${mediaIdCandidate}`,
        metadata: { sourceTopup: tx._id, providerReference },
      });

      distribution.push({
        recipient: null,
        amount: distributable,
        percent: null,
        holdingTxId: holdingTx._id,
        note: "No royalty splits provided",
      });

      await Topup.findByIdAndUpdate(topup._id, {
        $set: {
          status: "processing",
          distribution,
          platformFee: computedPlatformFee,
        },
      });

      return NextResponse.json({
        status: "processing",
        transactionId: tx._id,
        topupId: topup._id,
        providerReference,
        distribution,
        distributable,
        platformFee: computedPlatformFee,
      });
    }

    // =====================================================================
    // 7. DISTRIBUTE ROYALTIES
    // =====================================================================
    const sumPercent = splits.reduce(
      (acc, sp) => acc + Number(sp.percent || 0),
      0
    );

    for (const sp of splits) {
      const percent = Number(sp.percent || 0);
      const share = Number(
        ((distributable * percent) / sumPercent).toFixed(2)
      );

      const recipientId = sp.collaboratorUserId ?? sp.ownerId ?? null;
      let creditedUser = null;

      // Wallet credit
      if (recipientId) {
        try {
          creditedUser = await User.findByIdAndUpdate(
            recipientId,
            {
              $inc: { "wallet.balance": share },
              $push: { "wallet.history": tx._id },
            },
            { new: true }
          );
        } catch (err) {
          console.error("Wallet credit error:", err);
        }
      }

      // Royalty transaction
      const royaltyTx = await Transaction.create({
        user: recipientId,
        type: "royalty",
        amount: share,
        currency,
        paymentMethod: "mobile_money",
        status: creditedUser ? "settled" : "pending",
        description: `Royalty payout for media ${mediaIdCandidate}`,
        metadata: {
          sourceTopup: tx._id,
          royaltySplitId: sp._id,
          providerReference,
        },
      });

      distribution.push({
        recipient: recipientId,
        percent,
        amount: share,
        royaltyTxId: royaltyTx._id,
        walletBalanceAfter: creditedUser?.wallet?.balance ?? null,
      });
    }

    // =====================================================================
    // 8. FINAL TOPUP UPDATE
    // =====================================================================
    await Topup.findByIdAndUpdate(topup._id, {
      $set: {
        status: "processing",
        distribution,
        platformFee: computedPlatformFee,
        providerReference,
        rawResponse: providerRaw,
      },
    });

    return NextResponse.json({
      status: "processing",
      transactionId: tx._id,
      topupId: topup._id,
      providerReference,
      providerStatusCode,
      platformFee: computedPlatformFee,
      distributable,
      distribution,
    });
  } catch (err: any) {
    console.log("[MOBILE_PAY_ERROR]", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
