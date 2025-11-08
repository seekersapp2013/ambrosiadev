import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveMyWallet = mutation({
  args: {
    address: v.string(),
    publicKey: v.string(),
    privateKey: v.string(),
    mnemonic: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user already has a wallet
    const existingWallet = await ctx.db
      .query("wallets")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (existingWallet) {
      throw new Error("User already has a wallet");
    }

    await ctx.db.insert("wallets", {
      userId,
      address: args.address,
      publicKey: args.publicKey,
      privateKey: args.privateKey,
      mnemonic: args.mnemonic,
      createdAt: Date.now(),
    });
  },
});