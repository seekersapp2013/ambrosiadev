import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";

// Purchase content using internal wallet transfer
export const purchaseContent = mutation({
  args: {
    contentType: v.string(), // 'article' | 'reel'
    contentId: v.union(v.id("articles"), v.id("reels")),
    priceToken: v.string(),
    priceAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify the content exists and is gated
    let content: any = null;
    let contentAuthorId: Id<"users"> | undefined;

    if (args.contentType === 'article') {
      content = await ctx.db
        .query("articles")
        .filter((q) => q.eq(q.field("_id"), args.contentId))
        .first();
      contentAuthorId = content?.authorId;
    } else if (args.contentType === 'reel') {
      content = await ctx.db
        .query("reels")
        .filter((q) => q.eq(q.field("_id"), args.contentId))
        .first();
      contentAuthorId = content?.authorId;
    } else {
      throw new Error("Invalid content type");
    }

    if (!content || !content.isGated) {
      throw new Error("Content not found or not gated");
    }

    // Verify payment amount matches content price
    if (content.priceToken !== args.priceToken || content.priceAmount !== args.priceAmount) {
      throw new Error("Payment amount mismatch");
    }

    if (!contentAuthorId) {
      throw new Error("Content author not found");
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

    // Check if user is trying to buy their own content
    if (contentAuthorId === userId) {
      throw new Error("Cannot purchase your own content");
    }

    // Get buyer's wallet
    const buyerWallet = await ctx.db
      .query("wallets")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (!buyerWallet) {
      throw new Error("Buyer wallet not found");
    }

    // For now, we'll use USD for content purchases
    const currency = "USD";
    const buyerBalance = buyerWallet.balances.USD;

    if (buyerBalance < args.priceAmount) {
      throw new Error("Insufficient balance");
    }

    // Calculate platform fee (2%)
    const platformFee = args.priceAmount * 0.02;
    const sellerAmount = args.priceAmount - platformFee;

    // Get or create seller wallet
    let sellerWallet = await ctx.db
      .query("wallets")
      .withIndex("userId", (q) => q.eq("userId", contentAuthorId))
      .first();

    if (!sellerWallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId: contentAuthorId,
        primaryCurrency: "USD", // Default primary currency
        phoneCountryDetected: false,
        balances: {
          USD: 0, NGN: 0, GBP: 0, EUR: 0,
          CAD: 0, GHS: 0, KES: 0, GMD: 0, ZAR: 0
        },
        createdAt: Date.now(),
      });
      sellerWallet = await ctx.db.get(walletId);
      if (!sellerWallet) {
        throw new Error("Failed to create seller wallet");
      }
    }

    // Generate unique transaction ID
    const transactionId = `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record for content purchase
    await ctx.db.insert("transactions", {
      id: transactionId,
      fromUserId: userId,
      toUserId: contentAuthorId,
      amount: sellerAmount,
      currency: currency,
      type: "transfer",
      status: "completed",
      description: `Purchase of ${args.contentType}: ${content.title || content.caption || 'Untitled'}`,
      metadata: {
        contentType: args.contentType,
        contentId: args.contentId,
        platformFee,
        originalAmount: args.priceAmount,
      },
      createdAt: Date.now(),
      completedAt: Date.now(),
    });

    // Create platform fee transaction if applicable
    if (platformFee > 0) {
      const feeTransactionId = `fee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await ctx.db.insert("transactions", {
        id: feeTransactionId,
        fromUserId: userId,
        amount: platformFee,
        currency: currency,
        type: "transfer",
        status: "completed",
        description: `Platform fee for ${args.contentType} purchase`,
        metadata: {
          contentType: args.contentType,
          contentId: args.contentId,
          relatedTransactionId: transactionId,
        },
        createdAt: Date.now(),
        completedAt: Date.now(),
      });
    }

    // Update buyer balance
    const newBuyerBalances = { ...buyerWallet.balances };
    newBuyerBalances.USD -= args.priceAmount;
    await ctx.db.patch(buyerWallet._id, {
      balances: newBuyerBalances,
      updatedAt: Date.now(),
    });

    // Update seller balance
    if (!sellerWallet) {
      throw new Error("Seller wallet not found");
    }
    const newSellerBalances = { ...sellerWallet.balances };
    newSellerBalances.USD += sellerAmount;
    await ctx.db.patch(sellerWallet._id, {
      balances: newSellerBalances,
      updatedAt: Date.now(),
    });

    // Record the payment for access control
    const paymentId = await ctx.db.insert("payments", {
      payerId: userId,
      contentType: args.contentType,
      contentId: args.contentId,
      token: args.priceToken,
      amount: args.priceAmount,
      transactionId,
      createdAt: Date.now(),
    });

    // Send notifications
    await ctx.scheduler.runAfter(0, internal.notifications.createNotificationEvent, {
      type: 'CONTENT_PAYMENT',
      recipientUserId: contentAuthorId,
      actorUserId: userId,
      relatedContentType: args.contentType,
      relatedContentId: args.contentId,
      metadata: {
        amount: sellerAmount.toString(),
        token: args.priceToken,
        transactionId,
        platformFee: platformFee.toString(),
      },
    });

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