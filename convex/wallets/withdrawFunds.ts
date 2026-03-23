import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "../_generated/api";

export const withdrawFunds = mutation({
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

    // Get wallet
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const currentBalance = args.currency === "USD" ? wallet.balanceUSD : wallet.balanceNGN;

    if (currentBalance < args.amount) {
      throw new Error("Insufficient balance");
    }

    // Generate unique transaction ID
    const transactionId = `wit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record
    await ctx.db.insert("transactions", {
      id: transactionId,
      fromUserId: userId,
      amount: args.amount,
      currency: args.currency,
      type: "withdrawal",
      status: "completed",
      description: `Withdrawal of ${args.amount} ${args.currency}`,
      createdAt: Date.now(),
      completedAt: Date.now(),
    });

    // Update wallet balance based on currency
    const updateData: any = { updatedAt: Date.now() };
    if (args.currency === "USD") {
      updateData.balanceUSD = wallet.balanceUSD - args.amount;
    } else {
      updateData.balanceNGN = wallet.balanceNGN - args.amount;
    }

    await ctx.db.patch(wallet._id, updateData);

    // Send notification
    await ctx.scheduler.runAfter(0, internal.notifications.createNotificationEvent, {
      type: 'WALLET_WITHDRAWAL',
      recipientUserId: userId,
      metadata: {
        amount: args.amount.toString(),
        currency: args.currency,
        transactionId,
      },
    });

    const newBalance = currentBalance - args.amount;

    return {
      success: true,
      newBalance,
      currency: args.currency,
      transactionId,
    };
  },
});