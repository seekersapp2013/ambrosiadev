import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { EventJoinConfirmation } from './EventJoinConfirmation';

interface EventJoinFlowProps {
  eventId: Id<"events">;
  onSuccess: (bookingId: Id<"bookings">) => void;
  onCancel: () => void;
}

type FlowStep = 'confirmation' | 'success';

export function EventJoinFlow({ eventId, onSuccess, onCancel }: EventJoinFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('confirmation');
  const [completedBookingId, setCompletedBookingId] = useState<Id<"bookings"> | null>(null);

  // Get event information
  const event = useQuery(api.events.getEventById, { eventId });

  const handleBookingConfirmed = (bookingId: Id<"bookings">) => {
    setCompletedBookingId(bookingId);
    setCurrentStep('success');
  };

  const handleContinue = () => {
    if (completedBookingId) {
      onSuccess(completedBookingId);
    }
  };

  if (!event) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-2xl text-green-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Event Booking Confirmed!
          </h2>
          <p className="text-gray-600">
            You've successfully joined "{event.title}". You'll receive event details shortly.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-700 space-y-1 text-left">
            <li>• You'll receive a confirmation notification</li>
            <li>• The event organizer will share meeting details</li>
            <li>• Check your bookings to manage this event</li>
            <li>• You can cancel up to 24 hours before the event</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleContinue}
            className="w-full bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent/90"
          >
            Continue
          </button>
          
          <div className="text-sm text-gray-500">
            Booking ID: {completedBookingId}
          </div>
        </div>
      </div>
    );
  }

  return (
    <EventJoinConfirmation
      event={event}
      onConfirm={handleBookingConfirmed}
      onCancel={onCancel}
    />
  );
}