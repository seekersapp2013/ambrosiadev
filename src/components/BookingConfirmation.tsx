import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { GatedContentPaywall } from './GatedContentPaywall';

interface BookingDetails {
  providerId: Id<"users">;
  sessionDate: string;
  sessionTime: string;
  duration?: number;
}

interface BookingConfirmationProps {
  bookingDetails: BookingDetails;
  onConfirm: (bookingId: Id<"bookings">) => void;
  onCancel: () => void;
}

export function BookingConfirmation({ bookingDetails, onConfirm, onCancel }: BookingConfirmationProps) {
  const [showPaywall, setShowPaywall] = useState(false);

  // Get provider information
  const provider = useQuery(api.bookingSubscribers.getSubscriberByUserId, {
    userId: bookingDetails.providerId
  });

  const providerProfile = useQuery(api.profiles.getProfileByUserId, {
    userId: bookingDetails.providerId
  });

  const avatarUrl = useQuery(
    api.files.getFileUrl,
    providerProfile?.avatar ? { storageId: providerProfile.avatar } : "skip"
  );

  // Mutations
  const createBooking = useMutation(api.bookings.createBooking);

  if (!provider || !providerProfile) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const duration = bookingDetails.duration || 60;
  const totalAmount = (duration / 60) * provider.sessionPrice;

  const handlePaymentSuccess = async () => {
    try {
      const bookingId = await createBooking({
        providerId: bookingDetails.providerId,
        sessionDate: bookingDetails.sessionDate,
        sessionTime: bookingDetails.sessionTime,
        duration,
        paymentTxHash: "automated_payment"
      });

      onConfirm(bookingId);
    } catch (err) {
      console.error('Error creating booking:', err);
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-accent text-white p-6">
          <h1 className="text-2xl font-bold mb-2">Confirm Your Booking</h1>
          <p className="text-white/90">Review your session details and complete payment</p>
        </div>

        <div className="p-6">
          {/* Provider Information */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <img
              src={avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
              alt={providerProfile.name || providerProfile.username}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {providerProfile.name || providerProfile.username}
              </h3>
              <p className="text-gray-600">{provider.jobTitle}</p>
              <p className="text-sm text-gray-500">{provider.specialization}</p>
            </div>
          </div>

          {/* Session Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{formatDate(bookingDetails.sessionDate)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Time</span>
                <span className="font-medium">{formatTime(bookingDetails.sessionTime)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">{duration} minutes</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Rate</span>
                <span className="font-medium">${provider.sessionPrice}/hour</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-accent/10 px-4 rounded-lg">
                <span className="font-semibold text-gray-800">Total Amount</span>
                <span className="text-xl font-bold text-accent">${totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          {showPaywall ? (
            <GatedContentPaywall
              contentType="booking"
              title={`Session with ${providerProfile.name || providerProfile.username}`}
              price={totalAmount}
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
                  <li>• Your booking will be confirmed automatically</li>
                  <li>• You'll receive a notification with session details</li>
                  <li>• The provider will contact you with meeting information</li>
                  <li>• You can cancel up to 24 hours before the session</li>
                </ul>
              </div>

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
                  Proceed to Payment
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}