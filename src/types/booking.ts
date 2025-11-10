import { Id } from "../../convex/_generated/dataModel";

// Day schedule interface for open hours
export interface DaySchedule {
  start: string; // "09:00"
  end: string;   // "17:00"
  available: boolean;
}

// Weekly schedule interface
export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

// Booking subscriber interface
export interface BookingSubscriber {
  _id: Id<"bookingSubscribers">;
  userId: Id<"users">;
  jobTitle: string;
  specialization: string;
  oneOnOnePrice?: number; // Price for 1-on-1 sessions per hour
  groupSessionPrice?: number; // Price for group sessions per person per hour
  aboutUser: string;
  xLink?: string;
  linkedInLink?: string;
  offerDescription: string;
  openHours: WeeklySchedule;
  isActive: boolean;
  createdAt: number;
  updatedAt?: number;
}

// Booking status enum
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

// Confirmation type enum
export type ConfirmationType = "AUTOMATIC" | "MANUAL";

// Session type enum
export type SessionType = "ONE_ON_ONE" | "ONE_TO_MANY";

// Event status enum
export type EventStatus = "ACTIVE" | "CANCELLED" | "COMPLETED" | "FULL";

// Booking interface
export interface Booking {
  _id: Id<"bookings">;
  providerId: Id<"users">;
  clientId: Id<"users">;
  sessionDate: string; // "2024-03-15"
  sessionTime: string; // "14:00"
  duration: number;
  totalAmount: number;
  status: BookingStatus;
  paymentTxHash?: string;
  sessionDetails?: string;
  confirmationType: ConfirmationType;
  sessionType: SessionType;
  eventId?: Id<"events">;
  // LiveKit streaming fields
  liveStreamRoomName?: string;
  liveStreamStatus?: "NOT_STARTED" | "LIVE" | "ENDED";
  recordingId?: string;
  recordingUrl?: string;
  recordingStorageId?: string;
  uploadedToReels?: boolean;
  reelId?: Id<"reels">;
  createdAt: number;
  updatedAt?: number;
}

// Event interface for 1-to-many bookings
export interface Event {
  _id: Id<"events">;
  providerId: Id<"users">;
  title: string;
  description: string;
  sessionDate: string; // "2024-03-15"
  sessionTime: string; // "14:00"
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  pricePerPerson: number;
  status: EventStatus;
  sessionDetails?: string;
  tags?: string[];
  isPublic: boolean;
  // LiveKit streaming fields
  liveStreamRoomName?: string;
  liveStreamStatus?: "NOT_STARTED" | "LIVE" | "ENDED";
  recordingId?: string;
  recordingUrl?: string;
  recordingStorageId?: string;
  uploadedToReels?: boolean;
  reelId?: Id<"reels">;
  createdAt: number;
  updatedAt?: number;
}

// Booking settings interface
export interface BookingSettings {
  _id: Id<"bookingSettings">;
  userId: Id<"users">;
  confirmationType: ConfirmationType;
  bufferTime: number;
  maxAdvanceBooking: number;
  cancellationPolicy: string;
  sessionInstructions?: string;
  createdAt: number;
  updatedAt?: number;
}

// Provider with profile information (for display)
export interface ProviderWithProfile {
  subscriber: BookingSubscriber;
  profile: {
    name?: string;
    username: string;
    avatar?: string;
  };
  avatarUrl?: string;
}

// Booking with provider and client information (for display)
export interface BookingWithDetails {
  booking: Booking;
  provider: {
    name?: string;
    username: string;
    avatar?: string;
  };
  client: {
    name?: string;
    username: string;
    avatar?: string;
  };
  providerAvatarUrl?: string;
  clientAvatarUrl?: string;
}

// Time slot interface for calendar
export interface TimeSlot {
  time: string; // "14:00"
  available: boolean;
  booked?: boolean;
}

// Available day interface for calendar
export interface AvailableDay {
  date: string; // "2024-03-15"
  dayOfWeek: string; // "monday"
  timeSlots: TimeSlot[];
}

// Booking form data interface
export interface BookingFormData {
  jobTitle: string;
  specialization: string;
  oneOnOnePrice: number;
  groupSessionPrice: number;
  aboutUser: string;
  xLink: string;
  linkedInLink: string;
  offerDescription: string;
  openHours: WeeklySchedule;
}

// Event form data interface
export interface EventFormData {
  title: string;
  description: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  maxParticipants: number;
  pricePerPerson: number;
  sessionDetails?: string;
  tags?: string[];
  isPublic: boolean;
}

// Event with details interface
export interface EventWithDetails {
  event: Event;
  provider: {
    name?: string;
    username: string;
    avatar?: string;
  };
  providerAvatarUrl?: string;
  availableSpots: number;
}

// Filter options for provider search
export interface ProviderFilters {
  specialization?: string;
  jobTitle?: string;
  availableFrom?: string; // Date string
  availableTo?: string;   // Date string
  minPrice?: number;
  maxPrice?: number;
}