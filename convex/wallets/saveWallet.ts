import { mutation } from "../_generated/server"; // ✅ use `mutation` not `query`
import { v } from "convex/values";

export const saveWallet = mutation({
  args: {
    userId: v.id("users"),
    address: v.string(),
    publicKey: v.string(),
    privateKey: v.string(),
    mnemonic: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("wallets", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
