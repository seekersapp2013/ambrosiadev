import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ProviderList } from './ProviderList';
import { ProviderDetails } from './ProviderDetails';
import { ProviderSubscriptionFlow } from './ProviderSubscriptionFlow';
import { BookingCalendar } from './BookingCalendar';
import { BookingPaymentFlow } from './BookingPaymentFlow';
import { BookingSettings } from './BookingSettings';
import { BookingManagement } from './BookingManagement';
import { EventCreation } from './EventCreation';
import { EventManagement } from './EventManagement';
import { EventList } from './EventList';
import { EventJoinFlow } from './EventJoinFlow';
import { LiveStreamJoin } from './LiveStreamJoin';
import { RecordingManagement } from './RecordingManagement';

interface BookingScreenProps {
  onBack: () => void;
}

type ViewMode = 'main' | 'subscribe' | 'provider-details' | 'calendar' | 'payment' | 'settings' | 'success' | 'my-bookings' | 'create-event' | 'my-events' | 'event-join' | 'recordings';

interface BookingDetails {
  providerId: Id<"users">;
  sessionDate: string;
  sessionTime: string;
  duration?: number;
}

export function BookingScreen({ onBack }: BookingScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [selectedProviderId, setSelectedProviderId] = useState<Id<"users"> | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<Id<"events"> | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [completedBookingId, setCompletedBookingId] = useState<Id<"bookings"> | null>(null);

  // Check if current user is already a provider
  const mySubscription = useQuery(api.bookingSubscribers.getMySubscription);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProviderId(providerId as Id<"users">);
    setViewMode('provider-details');
  };

  const handleBookProvider = () => {
    if (selectedProviderId) {
      setViewMode('calendar');
    }
  };

  const handleTimeSelect = (date: string, time: string) => {
    if (selectedProviderId) {
      setBookingDetails({
        providerId: selectedProviderId,
        sessionDate: date,
        sessionTime: time,
        duration: 60
      });
      setViewMode('payment');
    }
  };

  const handleBookingSuccess = (bookingId: Id<"bookings">) => {
    setCompletedBookingId(bookingId);
    setViewMode('success');
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId as Id<"events">);
    setViewMode('event-join');
  };

  const handleBackToMain = () => {
    setViewMode('main');
    setSelectedProviderId(null);
    setSelectedEventId(null);
    setBookingDetails(null);
    setCompletedBookingId(null);
  };

  const handleSubscriptionComplete = () => {
    setViewMode('main');
  };

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'subscribe':
        return (
          <ProviderSubscriptionFlow
            onBack={handleBackToMain}
            onComplete={handleSubscriptionComplete}
          />
        );

      case 'provider-details':
        return selectedProviderId ? (
          <ProviderDetails
            providerId={selectedProviderId}
            onBook={handleBookProvider}
            onBack={handleBackToMain}
          />
        ) : null;

      case 'calendar':
        return selectedProviderId ? (
          <BookingCalendar
            providerId={selectedProviderId}
            onTimeSelect={handleTimeSelect}
            onBack={() => setViewMode('provider-details')}
          />
        ) : null;

      case 'payment':
        return bookingDetails ? (
          <BookingPaymentFlow
            bookingDetails={bookingDetails}
            onSuccess={handleBookingSuccess}
            onCancel={handleBackToMain}
          />
        ) : null;

      case 'event-join':
        return selectedEventId ? (
          <EventJoinFlow
            eventId={selectedEventId}
            onSuccess={handleBookingSuccess}
            onCancel={handleBackToMain}
          />
        ) : null;

      case 'settings':
        return (
          <BookingSettings
            onBack={handleBackToMain}
          />
        );

      case 'my-bookings':
        return (
          <BookingManagement
            onBack={handleBackToMain}
          />
        );

      case 'create-event':
        return (
          <EventCreation
            onBack={handleBackToMain}
            onSuccess={handleBackToMain}
          />
        );

      case 'my-events':
        return (
          <EventManagement
            onBack={handleBackToMain}
            onCreateEvent={() => setViewMode('create-event')}
          />
        );

      case 'recordings':
        return (
          <RecordingManagement
            onBack={handleBackToMain}
          />
        );

      case 'success':
        return (
          <div className="max-w-md mx-auto p-6 bg-white text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-2xl text-green-600"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Booking Complete!
              </h2>
              <p className="text-gray-600">
                Your session has been successfully booked. You'll receive a confirmation notification shortly.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleBackToMain}
                className="w-full bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent/90"
              >
                Browse More Providers
              </button>

              <button
                onClick={onBack}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50"
              >
                Back to Home
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="max-w-6xl mx-auto p-4">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Book a Session</h1>
              <p className="text-gray-600">
                Connect with experts and book personalized sessions
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mb-6 flex flex-wrap gap-4">
              <button
                onClick={() => setViewMode('my-bookings')}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-calendar-alt mr-2"></i>
                My Bookings
              </button>

              <button
                onClick={() => setViewMode('subscribe')}
                className="flex items-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                <i className="fas fa-user-plus mr-2"></i>
                {mySubscription ? 'Update Your Service' : 'Become a Provider'}
              </button>

              {mySubscription && (
                <>
                  <button
                    onClick={() => setViewMode('my-events')}
                    className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <i className="fas fa-users mr-2"></i>
                    My Events
                  </button>

                  <button
                    onClick={() => setViewMode('create-event')}
                    className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Create Event
                  </button>

                  <button
                    onClick={() => setViewMode('recordings')}
                    className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <i className="fas fa-video mr-2"></i>
                    My Recordings
                  </button>

                  <button
                    onClick={() => setViewMode('settings')}
                    className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <i className="fas fa-cog mr-2"></i>
                    Booking Settings
                  </button>
                </>
              )}
            </div>

            {/* Provider Status */}
            {mySubscription && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-800">Your Provider Status</h3>
                    <p className="text-blue-700 text-sm">
                      {mySubscription.isActive ? (
                        <>
                          <i className="fas fa-check-circle mr-1"></i>
                          Active - Accepting bookings as {mySubscription.jobTitle}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-pause-circle mr-1"></i>
                          Inactive - Not accepting bookings
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-800">${mySubscription.sessionPrice}</div>
                    <div className="text-sm text-blue-600">per session</div>
                  </div>
                </div>
              </div>
            )}

            {/* Provider List */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Experts</h2>
              <ProviderList onProviderSelect={handleProviderSelect} />
            </div>

            {/* Available Events */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Events</h2>
              <EventList onEventSelect={handleEventSelect} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentView()}
    </div>
  );
}