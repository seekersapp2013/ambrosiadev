import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { GatedContentPaywall } from './GatedContentPaywall';

interface EventBookingConfirmationProps {
  eventId: Id<"events">;
  onConfirm: (bookingId: Id<"bookings">) => void;
  onCancel: () => void;
}

export function EventBookingConfirmation({ eventId, onConfirm, onCancel }: EventBookingConfirmationProps) {
  const [showPaywall, setShowPaywall] = useState(false);

  // Get event information
  const eventData = useQuery(api.events.getEventById, { eventId });

  const providerProfile = useQuery(
    api.profiles.getProfileByUserId,
    eventData ? { userId: eventData.providerId } : "skip"
  );

  const avatarUrl = useQuery(
    api.files.getFileUrl,
    providerProfile?.avatar ? { storageId: providerProfile.avatar } : "skip"
  );

  // Mutations
  const createEventBooking = useMutation(api.bookings.createEventBooking);

  if (!eventData || !providerProfile) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const handlePaymentSuccess = async () => {
    try {
      const bookingId = await createEventBooking({
        eventId,
        paymentTxHash: "automated_payment"
      });

      onConfirm(bookingId);
    } catch (err) {
      console.error('Error creating event booking:', err);
    }
  };

  const handleProceedToPayment = () => {
    setShowPaywall(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-accent text-white p-6">
          <h1 className="text-2xl font-bold mb-2">Join Event</h1>
          <p className="text-white/90">Confirm your participation in this group session</p>
        </div>

        <div className="p-6">
          {/* Event Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{eventData.title}</h3>
            <p className="text-gray-600 mb-4">{eventData.description}</p>
            
            {/* Provider Info */}
            <div className="flex items-center space-x-3">
              <img
                src={avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
                alt={providerProfile.name || providerProfile.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-800">
                  {providerProfile.name || providerProfile.username}
                </p>
                <p className="text-sm text-gray-600">
                  {eventData.provider?.subscription?.jobTitle}
                </p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{formatDate(eventData.sessionDate)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Time</span>
                <span className="font-medium">{formatTime(eventData.sessionTime)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">{formatDuration(eventData.duration)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Participants</span>
                <span className="font-medium">
                  {eventData.currentParticipants + 1}/{eventData.maxParticipants}
                  <span className="text-sm text-gray-500 ml-1">
                    (including you)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-accent/10 px-4 rounded-lg">
                <span className="font-semibold text-gray-800">Price</span>
                <span className="text-xl font-bold text-accent">${eventData.pricePerPerson}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {eventData.tags && eventData.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Topics</h4>
              <div className="flex flex-wrap gap-2">
                {eventData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Payment Section */}
          {showPaywall ? (
            <GatedContentPaywall
              contentType="booking"
              title={eventData.title}
              price={eventData.pricePerPerson}
              token="USD"
              sellerAddress={providerProfile?.walletAddress}
              onUnlock={handlePaymentSuccess}
              onFundWallet={() => {
                // Handle fund wallet navigation if needed
                console.log('Fund wallet requested');
              }}
            />
          ) : (
            <>
              {/* What to Expect */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">What to Expect</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• You'll join a group session with other participants</li>
                  <li>• The provider will share session details after confirmation</li>
                  <li>• You can interact with other participants during the session</li>
                  <li>• Cancellation policy applies as per provider settings</li>
                </ul>
              </div>

              {/* Session Instructions */}
              {eventData.sessionDetails && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Session Instructions</h4>
                  <p className="text-sm text-blue-700">{eventData.sessionDetails}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToPayment}
                  className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Join Event - ${eventData.pricePerPerson}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}