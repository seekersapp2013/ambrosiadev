import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getWalletBalance = query({
  args: {
    currency: v.optional(v.string()), // "USD" or "NGN"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (!wallet) {
      return { 
        balanceUSD: 0, 
        balanceNGN: 0,
        currency: args.currency || "USD"
      };
    }

    return { 
      balanceUSD: wallet.balanceUSD, 
      balanceNGN: wallet.balanceNGN,
      currency: args.currency || "USD"
    };
  },
});

export const getMyWallet = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("wallets")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();
  },
});