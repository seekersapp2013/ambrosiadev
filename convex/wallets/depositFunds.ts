import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "../_generated/api";

export const depositFunds = mutation({
  args: {
    amount: v.number(),
    currency: v.string(), // "USD" or "NGN"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (args.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (!["USD", "NGN"].includes(args.currency)) {
      throw new Error("Currency must be USD or NGN");
    }

    // Get or create wallet
    let wallet = await ctx.db
      .query("wallets")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (!wallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId,
        balanceUSD: 0,
        balanceNGN: 0,
        createdAt: Date.now(),
      });
      wallet = await ctx.db.get(walletId);
      if (!wallet) {
        throw new Error("Failed to create wallet");
      }
    }

    // Generate unique transaction ID
    const transactionId = `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record
    await ctx.db.insert("transactions", {
      id: transactionId,
      toUserId: userId,
      amount: args.amount,
      currency: args.currency,
      type: "deposit",
      status: "completed",
      description: `Deposit of ${args.amount} ${args.currency}`,
      createdAt: Date.now(),
      completedAt: Date.now(),
    });

    // Update wallet balance based on currency
    const updateData: any = { updatedAt: Date.now() };
    if (args.currency === "USD") {
      updateData.balanceUSD = wallet.balanceUSD + args.amount;
    } else {
      updateData.balanceNGN = wallet.balanceNGN + args.amount;
    }

    if (!wallet) {
      throw new Error("Wallet not found");
    }
    await ctx.db.patch(wallet._id, updateData);

    // Send notification
    await ctx.scheduler.runAfter(0, internal.notifications.createNotificationEvent, {
      type: 'WALLET_DEPOSIT',
      recipientUserId: userId,
      metadata: {
        amount: args.amount.toString(),
        currency: args.currency,
        transactionId,
      },
    });

    const newBalance = args.currency === "USD" 
      ? wallet.balanceUSD + args.amount 
      : wallet.balanceNGN + args.amount;

    return {
      success: true,
      newBalance,
      currency: args.currency,
      transactionId,
    };
  },
});