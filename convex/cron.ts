import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every 5 minutes to update booking statuses
crons.interval(
  "update booking statuses",
  { minutes: 5 },
  internal.bookings.updateBookingStatusByTime
);

// Run every hour to auto-complete expired sessions
crons.interval(
  "auto complete expired sessions",
  { minutes: 60 },
  internal.bookings.autoCompleteExpiredSessions
);

export default crons;