import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createWallet = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if wallet already exists
    const existingWallet = await ctx.db
      .query("wallets")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (existingWallet) {
      return existingWallet;
    }

    // Create new wallet with 0 balance for both currencies
    const walletId = await ctx.db.insert("wallets", {
      userId,
      balanceUSD: 0,
      balanceNGN: 0,
      createdAt: Date.now(),
    });

    return await ctx.db.get(walletId);
  },
});