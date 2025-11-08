import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

const crons = cronJobs();

// Process notification batching every 5 minutes
crons.interval(
  "process notification batching",
  { minutes: 5 },
  internal.batchingService.processAllPendingBatches,
  {}
);

// Process intelligent delivery timing every 5 minutes
crons.interval(
  "process intelligent delivery",
  { minutes: 5 },
  internal.intelligentTiming.processIntelligentDelivery,
  {}
);

// Process scheduled notifications every 5 minutes
crons.interval(
  "process scheduled notifications",
  { minutes: 5 },
  internal.notifications.processScheduledNotifications,
  {}
);

// Retry failed email deliveries every hour
crons.interval(
  "retry failed emails",
  { hours: 1 },
  internal.emails.retryFailedEmails,
  {}
);

// Clean up old notifications daily at 2 AM
crons.daily(
  "cleanup old notifications",
  { hourUTC: 2, minuteUTC: 0 },
  internal.notifications.deleteOldNotifications,
  { olderThanDays: 30 }
);

// Clean up old batches weekly
crons.weekly(
  "cleanup old batches",
  { dayOfWeek: "sunday", hourUTC: 3, minuteUTC: 0 },
  internal.batchingService.cleanupOldBatches,
  { olderThanDays: 7 }
);

export default crons;

// User activity tracking - called when user interacts with the app
export const trackUserActivity = internalMutation({
  args: {
    userId: v.id("users"),
    sessionDuration: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.intelligentTiming.trackUserActivity, args);
  },
});