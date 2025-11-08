import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";

// Purchase content (token-gated)
export const purchaseContent = mutation({
  args: {
    contentType: v.string(), // 'article' | 'reel'
    contentId: v.union(v.id("articles"), v.id("reels")),
    priceToken: v.string(),
    priceAmount: v.number(),
    txHash: v.string(), // Transaction hash from blockchain
    network: v.string(), // e.g., 'celo'
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify the content exists and is gated
    if (args.contentType === 'article') {
      const content = await ctx.db
        .query("articles")
        .filter((q) => q.eq(q.field("_id"), args.contentId))
        .first();
      if (!content || !content.isGated) {
        throw new Error("Content not found or not gated");
      }
      // Verify payment amount matches content price
      if (content.priceToken !== args.priceToken || content.priceAmount !== args.priceAmount) {
        throw new Error("Payment amount mismatch");
      }
    } else if (args.contentType === 'reel') {
      const content = await ctx.db
        .query("reels")
        .filter((q) => q.eq(q.field("_id"), args.contentId))
        .first();
      if (!content || !content.isGated) {
        throw new Error("Content not found or not gated");
      }
      // Verify payment amount matches content price
      if (content.priceToken !== args.priceToken || content.priceAmount !== args.priceAmount) {
        throw new Error("Payment amount mismatch");
      }
    } else {
      throw new Error("Invalid content type");
    }

    // Check if already purchased
    const existingPayment = await ctx.db
      .query("payments")
      .withIndex("by_content", (q) => 
        q.eq("contentType", args.contentType).eq("contentId", args.contentId)
      )
      .filter((q) => q.eq(q.field("payerId"), userId))
      .first();

    if (existingPayment) {
      throw new Error("Content already purchased");
    }

    // Record the payment
    const paymentId = await ctx.db.insert("payments", {
      payerId: userId,
      contentType: args.contentType,
      contentId: args.contentId,
      token: args.priceToken,
      amount: args.priceAmount,
      network: args.network,
      txHash: args.txHash,
      createdAt: Date.now(),
    });

    // Trigger high-priority notification for content creator
    let contentAuthorId: Id<"users"> | undefined;
    if (args.contentType === 'article') {
      const article = await ctx.db
        .query("articles")
        .filter((q) => q.eq(q.field("_id"), args.contentId))
        .first();
      contentAuthorId = article?.authorId;
    } else if (args.contentType === 'reel') {
      const reel = await ctx.db
        .query("reels")
        .filter((q) => q.eq(q.field("_id"), args.contentId))
        .first();
      contentAuthorId = reel?.authorId;
    }

    if (contentAuthorId && contentAuthorId !== userId) {
      await ctx.runMutation(internal.notifications.createNotificationEvent, {
        type: 'CONTENT_PAYMENT',
        recipientUserId: contentAuthorId,
        actorUserId: userId,
        relatedContentType: args.contentType,
        relatedContentId: args.contentId,
        metadata: {
          amount: args.priceAmount.toString(),
          token: args.priceToken,
          txHash: args.txHash,
        },
      });
    }

    return paymentId;
  },
});

// Check if user has access to content
export const hasAccess = query({
  args: {
    contentType: v.string(),
    contentId: v.union(v.id("articles"), v.id("reels")),
  },
  handler: async (ctx, args) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        return false;
      }

      // Check if user is the creator
      if (args.contentType === 'article') {
        const content = await ctx.db
          .query("articles")
          .filter((q) => q.eq(q.field("_id"), args.contentId))
          .first();
        
        if (!content) {
          return false;
        }
        
        if (content.authorId === userId) {
          return true;
        }
        
        // If content is not gated, everyone has access
        if (!content.isGated) {
          return true;
        }
      } else if (args.contentType === 'reel') {
        const content = await ctx.db
          .query("reels")
          .filter((q) => q.eq(q.field("_id"), args.contentId))
          .first();
        
        if (!content) {
          return false;
        }
        
        if (content.authorId === userId) {
          return true;
        }
        
        // If content is not gated, everyone has access
        if (!content.isGated) {
          return true;
        }
      } else {
        return false;
      }

      // Check if user has purchased access
      const payment = await ctx.db
        .query("payments")
        .withIndex("by_content", (q) => 
          q.eq("contentType", args.contentType).eq("contentId", args.contentId)
        )
        .filter((q) => q.eq(q.field("payerId"), userId))
        .first();

      return !!payment;
    } catch (error) {
      console.error('Error in hasAccess query:', error);
      return false;
    }
  },
});

// Get user's purchase history
export const getUserPurchases = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const purchases = await ctx.db
      .query("payments")
      .withIndex("by_payer", (q) => q.eq("payerId", userId))
      .order("desc")
      .collect();

    // Get content details for each purchase
    const purchasesWithContent = await Promise.all(
      purchases.map(async (purchase) => {
        if (purchase.contentType === 'article') {
          const content = await ctx.db
            .query("articles")
            .filter((q) => q.eq(q.field("_id"), purchase.contentId as any))
            .first();
          if (content) {
            const author = await ctx.db.get(content.authorId);
            const profile = await ctx.db
              .query("profiles")
              .filter((q) => q.eq(q.field("userId"), content.authorId))
              .first();

            return {
              ...purchase,
              content: {
                ...content,
                author: {
                  id: author?._id,
                  name: author?.name || profile?.name,
                  username: profile?.username,
                  avatar: profile?.avatar,
                },
              },
            };
          }
        } else if (purchase.contentType === 'reel') {
          const content = await ctx.db
            .query("reels")
            .filter((q) => q.eq(q.field("_id"), purchase.contentId as any))
            .first();
          if (content) {
            const author = await ctx.db.get(content.authorId);
            const profile = await ctx.db
              .query("profiles")
              .filter((q) => q.eq(q.field("userId"), content.authorId))
              .first();

            return {
              ...purchase,
              content: {
                ...content,
                author: {
                  id: author?._id,
                  name: author?.name || profile?.name,
                  username: profile?.username,
                  avatar: profile?.avatar,
                },
              },
            };
          }
        }
        return null;
      })
    );

    return purchasesWithContent.filter(p => p !== null);
  },
});

// Get creator's earnings
export const getCreatorEarnings = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get all payments for content created by this user
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();

    const reels = await ctx.db
      .query("reels")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();

    const contentIds = [
      ...articles.map(a => a._id),
      ...reels.map(r => r._id)
    ];

    const allPayments = [];
    for (const contentId of contentIds) {
      const payments = await ctx.db
        .query("payments")
        .withIndex("by_content", (q) => 
          q.eq("contentType", articles.find(a => a._id === contentId) ? "article" : "reel")
           .eq("contentId", contentId)
        )
        .collect();
      allPayments.push(...payments);
    }

    // Calculate total earnings by token
    const earnings = allPayments.reduce((acc, payment) => {
      if (!acc[payment.token]) {
        acc[payment.token] = 0;
      }
      acc[payment.token] += payment.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPayments: allPayments.length,
      earnings,
      recentPayments: allPayments
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10),
    };
  },
});