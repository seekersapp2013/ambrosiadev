import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Create a new event
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    sessionDate: v.string(), // YYYY-MM-DD format
    sessionTime: v.string(), // HH:MM format
    duration: v.number(), // Duration in minutes
    maxParticipants: v.number(),
    pricePerPerson: v.number(),
    sessionDetails: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user is a provider
    const provider = await ctx.db
      .query("bookingSubscribers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!provider || !provider.isActive) {
      throw new Error("Only active providers can create events");
    }

    // Validate event data
    if (args.maxParticipants < 2) {
      throw new Error("Events must allow at least 2 participants");
    }

    if (args.pricePerPerson < 0) {
      throw new Error("Price per person cannot be negative");
    }

    // Check if the time slot conflicts with existing events or 1-on-1 bookings
    const isAvailable = await checkEventTimeSlotAvailability(ctx, {
      providerId: userId,
      sessionDate: args.sessionDate,
      sessionTime: args.sessionTime,
      duration: args.duration
    });

    if (!isAvailable) {
      // Provide more detailed error information
      const existingBookings = await ctx.db
        .query("bookings")
        .withIndex("by_provider_date", (q: any) => 
          q.eq("providerId", userId).eq("sessionDate", args.sessionDate)
        )
        .filter((q: any) => q.or(
          q.eq(q.field("status"), "CONFIRMED"),
          q.eq(q.field("status"), "PENDING")
        ))
        .collect();

      const existingEvents = await ctx.db
        .query("events")
        .withIndex("by_provider_date", (q: any) => 
          q.eq("providerId", userId).eq("sessionDate", args.sessionDate)
        )
        .filter((q: any) => q.eq(q.field("status"), "ACTIVE"))
        .collect();

      const conflicts = [];
      if (existingBookings.length > 0) {
        conflicts.push(`${existingBookings.length} existing booking(s)`);
      }
      if (existingEvents.length > 0) {
        conflicts.push(`${existingEvents.length} existing event(s)`);
      }

      throw new Error(`Time slot ${args.sessionTime} on ${args.sessionDate} conflicts with ${conflicts.join(' and ')}`);
    }

    const now = Date.now();

    // Create event
    const eventId = await ctx.db.insert("events", {
      providerId: userId,
      title: args.title,
      description: args.description,
      sessionDate: args.sessionDate,
      sessionTime: args.sessionTime,
      duration: args.duration,
      maxParticipants: args.maxParticipants,
      currentParticipants: 0,
      pricePerPerson: args.pricePerPerson,
      status: "ACTIVE",
      sessionDetails: args.sessionDetails,
      tags: args.tags || [],
      isPublic: args.isPublic ?? true,
      createdAt: now
    });

    return eventId;
  }
});

// Get events by provider
export const getProviderEvents = query({
  args: {
    providerId: v.optional(v.id("users")),
    status: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const targetProviderId = args.providerId || userId;

    if (!targetProviderId) {
      return [];
    }

    let query = ctx.db
      .query("events")
      .withIndex("by_provider", (q) => q.eq("providerId", targetProviderId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const events = await query.order("desc").collect();

    // Get provider information
    const provider = await ctx.db
      .query("bookingSubscribers")
      .withIndex("by_user", (q) => q.eq("userId", targetProviderId))
      .first();

    const providerProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", targetProviderId))
      .first();

    return events.map(event => ({
      ...event,
      provider: {
        subscription: provider,
        profile: providerProfile
      },
      availableSpots: event.maxParticipants - event.currentParticipants
    }));
  }
});

// Get public events with pagination
export const getPublicEvents = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    dateFrom: v.optional(v.string()),
    dateTo: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    let query = ctx.db
      .query("events")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .filter((q) => q.eq(q.field("status"), "ACTIVE"));

    // Get all events first, then apply filters in JavaScript
    let allEvents = await query.order("asc").collect();
    
    // Apply filters
    if (args.tags && args.tags.length > 0) {
      allEvents = allEvents.filter(event => 
        event.tags && event.tags.some(tag => args.tags!.includes(tag))
      );
    }

    if (args.minPrice !== undefined) {
      allEvents = allEvents.filter(event => event.pricePerPerson >= args.minPrice!);
    }

    if (args.maxPrice !== undefined) {
      allEvents = allEvents.filter(event => event.pricePerPerson <= args.maxPrice!);
    }

    if (args.dateFrom) {
      allEvents = allEvents.filter(event => event.sessionDate >= args.dateFrom!);
    }

    if (args.dateTo) {
      allEvents = allEvents.filter(event => event.sessionDate <= args.dateTo!);
    }

    const events = allEvents.slice(offset, offset + limit);

    // Get provider information for each event
    const eventsWithProviders = await Promise.all(
      events.map(async (event) => {
        const provider = await ctx.db
          .query("bookingSubscribers")
          .withIndex("by_user", (q) => q.eq("userId", event.providerId))
          .first();

        const providerProfile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", event.providerId))
          .first();

        return {
          ...event,
          provider: {
            subscription: provider,
            profile: providerProfile
          },
          availableSpots: event.maxParticipants - event.currentParticipants
        };
      })
    );

    return {
      events: eventsWithProviders,
      hasMore: offset + limit < allEvents.length,
      total: allEvents.length
    };
  }
});

// Get event by ID
export const getEventById = query({
  args: {
    eventId: v.id("events")
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      return null;
    }

    // Get provider information
    const provider = await ctx.db
      .query("bookingSubscribers")
      .withIndex("by_user", (q) => q.eq("userId", event.providerId))
      .first();

    const providerProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", event.providerId))
      .first();

    // Get participants
    const participants = await ctx.db
      .query("bookings")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.or(
        q.eq(q.field("status"), "CONFIRMED"),
        q.eq(q.field("status"), "PENDING")
      ))
      .collect();

    return {
      ...event,
      provider: {
        subscription: provider,
        profile: providerProfile
      },
      availableSpots: event.maxParticipants - event.currentParticipants,
      participants: participants.length
    };
  }
});

// Update event
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    sessionDate: v.optional(v.string()),
    sessionTime: v.optional(v.string()),
    duration: v.optional(v.number()),
    maxParticipants: v.optional(v.number()),
    pricePerPerson: v.optional(v.number()),
    sessionDetails: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Only provider can update their event
    if (event.providerId !== userId) {
      throw new Error("Not authorized to update this event");
    }

    // Don't allow updates if event has participants and is changing critical details
    if (event.currentParticipants > 0) {
      if (args.sessionDate || args.sessionTime || args.duration) {
        throw new Error("Cannot change date/time for events with existing participants");
      }
      
      if (args.maxParticipants && args.maxParticipants < event.currentParticipants) {
        throw new Error("Cannot reduce max participants below current participant count");
      }
    }

    const updateData: any = {
      updatedAt: Date.now()
    };

    // Add provided fields to update
    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.sessionDate !== undefined) updateData.sessionDate = args.sessionDate;
    if (args.sessionTime !== undefined) updateData.sessionTime = args.sessionTime;
    if (args.duration !== undefined) updateData.duration = args.duration;
    if (args.maxParticipants !== undefined) updateData.maxParticipants = args.maxParticipants;
    if (args.pricePerPerson !== undefined) updateData.pricePerPerson = args.pricePerPerson;
    if (args.sessionDetails !== undefined) updateData.sessionDetails = args.sessionDetails;
    if (args.tags !== undefined) updateData.tags = args.tags;
    if (args.isPublic !== undefined) updateData.isPublic = args.isPublic;

    await ctx.db.patch(args.eventId, updateData);

    return args.eventId;
  }
});

// Cancel event
export const cancelEvent = mutation({
  args: {
    eventId: v.id("events"),
    reason: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Only provider can cancel their event
    if (event.providerId !== userId) {
      throw new Error("Not authorized to cancel this event");
    }

    // Update event status
    await ctx.db.patch(args.eventId, {
      status: "CANCELLED",
      updatedAt: Date.now()
    });

    // Cancel all related bookings
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.or(
        q.eq(q.field("status"), "CONFIRMED"),
        q.eq(q.field("status"), "PENDING")
      ))
      .collect();

    for (const booking of bookings) {
      await ctx.db.patch(booking._id, {
        status: "CANCELLED",
        updatedAt: Date.now()
      });

      // Send cancellation notification
      try {
        await ctx.scheduler.runAfter(0, internal.bookingNotifications.sendBookingCancellationNotification, {
          bookingId: booking._id,
          cancelledBy: "provider",
          reason: args.reason
        });
      } catch (error) {
        console.error("Failed to send event cancellation notification:", error);
      }
    }

    return args.eventId;
  }
});

// Delete event (permanently remove from database)
export const deleteEvent = mutation({
  args: {
    eventId: v.id("events")
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Only the event creator can delete their event
    if (event.providerId !== userId) {
      throw new Error("Not authorized to delete this event");
    }

    // Check if event has any confirmed bookings
    const confirmedBookings = await ctx.db
      .query("bookings")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("status"), "CONFIRMED"))
      .collect();

    if (confirmedBookings.length > 0) {
      throw new Error("Cannot delete event with confirmed bookings. Cancel the event instead.");
    }

    // Get all related bookings (including pending ones)
    const allBookings = await ctx.db
      .query("bookings")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Delete all related bookings
    for (const booking of allBookings) {
      await ctx.db.delete(booking._id);
    }

    // Delete the event
    await ctx.db.delete(args.eventId);

    return { success: true, deletedBookings: allBookings.length };
  }
});

// Helper function to check event time slot availability
async function checkEventTimeSlotAvailability(ctx: any, args: {
  providerId: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  eventId?: string; // Optional: exclude this event from conflict check (for updates)
}) {
  try {
    // Check against existing 1-on-1 bookings
    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_provider_date", (q: any) => 
        q.eq("providerId", args.providerId).eq("sessionDate", args.sessionDate)
      )
      .filter((q: any) => q.or(
        q.eq(q.field("status"), "CONFIRMED"),
        q.eq(q.field("status"), "PENDING")
      ))
      .collect();

    // Check against existing events
    let existingEventsQuery = ctx.db
      .query("events")
      .withIndex("by_provider_date", (q: any) => 
        q.eq("providerId", args.providerId).eq("sessionDate", args.sessionDate)
      )
      .filter((q: any) => q.eq(q.field("status"), "ACTIVE"));

    const existingEvents = await existingEventsQuery.collect();

    const sessionStart = timeToMinutes(args.sessionTime);
    const sessionEnd = sessionStart + args.duration;

    // Check for conflicts with bookings
    for (const booking of existingBookings) {
      const bookingStart = timeToMinutes(booking.sessionTime);
      const bookingEnd = bookingStart + booking.duration;

      // Check if times overlap (fixed logic)
      if (hasTimeOverlap(sessionStart, sessionEnd, bookingStart, bookingEnd)) {
        console.log(`Booking conflict found: ${booking.sessionTime} (${booking.duration}min) overlaps with ${args.sessionTime} (${args.duration}min)`);
        return false;
      }
    }

    // Check for conflicts with events (exclude current event if updating)
    for (const event of existingEvents) {
      // Skip if this is the same event being updated
      if (args.eventId && event._id === args.eventId) {
        continue;
      }

      const eventStart = timeToMinutes(event.sessionTime);
      const eventEnd = eventStart + event.duration;

      // Check if times overlap (fixed logic)
      if (hasTimeOverlap(sessionStart, sessionEnd, eventStart, eventEnd)) {
        console.log(`Event conflict found: ${event.sessionTime} (${event.duration}min) overlaps with ${args.sessionTime} (${args.duration}min)`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking time slot availability:", error);
    // In case of error, be conservative and return false
    return false;
  }
}

// Helper function to check if two time ranges overlap
function hasTimeOverlap(start1: number, end1: number, start2: number, end2: number): boolean {
  // Two ranges overlap if one starts before the other ends and vice versa
  return start1 < end2 && start2 < end1;
}

// Helper function to convert time string to minutes
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// Get provider's schedule for a specific date (for debugging conflicts)
export const getProviderSchedule = query({
  args: {
    providerId: v.optional(v.id("users")),
    sessionDate: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const targetProviderId = args.providerId || userId;

    if (!targetProviderId) {
      return { bookings: [], events: [] };
    }

    // Get all bookings for the date
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_provider_date", (q) => 
        q.eq("providerId", targetProviderId).eq("sessionDate", args.sessionDate)
      )
      .filter((q) => q.or(
        q.eq(q.field("status"), "CONFIRMED"),
        q.eq(q.field("status"), "PENDING")
      ))
      .collect();

    // Get all events for the date
    const events = await ctx.db
      .query("events")
      .withIndex("by_provider_date", (q) => 
        q.eq("providerId", targetProviderId).eq("sessionDate", args.sessionDate)
      )
      .filter((q) => q.eq(q.field("status"), "ACTIVE"))
      .collect();

    return {
      bookings: bookings.map(b => ({
        id: b._id,
        sessionTime: b.sessionTime,
        duration: b.duration,
        status: b.status,
        type: 'booking'
      })),
      events: events.map(e => ({
        id: e._id,
        sessionTime: e.sessionTime,
        duration: e.duration,
        title: e.title,
        status: e.status,
        type: 'event'
      }))
    };
  }
});