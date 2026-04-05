import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { EventPaymentFlow } from './EventPaymentFlow';

interface EventBookingConfirmationProps {
  eventId: Id<"events">;
  onConfirm: (bookingId: Id<"bookings">) => void;
  onCancel: () => void;
}

export function EventBookingConfirmation({ eventId, onConfirm, onCancel }: EventBookingConfirmationProps) {
  // Get event information
  const eventData = useQuery(api.events.getEventById, { eventId });

  if (!eventData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <EventPaymentFlow
      event={eventData}
      onSuccess={onConfirm}
      onCancel={onCancel}
    />
  );
}