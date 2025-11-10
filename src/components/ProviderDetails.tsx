import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface ProviderDetailsProps {
  providerId: Id<"users">;
  onBook: () => void;
  onBack: () => void;
}

export function ProviderDetails({ providerId, onBook, onBack }: ProviderDetailsProps) {
  // Get provider subscription data
  const subscriber = useQuery(api.bookingSubscribers.getSubscriberByUserId, {
    userId: providerId
  });

  // Get provider profile
  const profile = useQuery(api.profiles.getProfileByUserId, {
    userId: providerId
  });

  // Get avatar URL
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    profile?.avatar ? { storageId: profile.avatar } : "skip"
  );

  if (!subscriber || !profile) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!subscriber.isActive) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-user-slash text-2xl text-gray-400"></i>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Provider Not Available</h2>
        <p className="text-gray-600 mb-4">This provider is currently not accepting bookings.</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Providers
        </button>
      </div>
    );
  }

  // Calculate available days
  const availableDays = Object.entries(subscriber.openHours)
    .filter(([_, schedule]) => schedule.available)
    .map(([day, schedule]) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      schedule
    }));

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Providers
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Provider Header */}
        <div className="bg-gradient-to-r from-accent to-accent/80 text-white p-6">
          <div className="flex items-start space-x-4">
            <img
              src={avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
              alt={profile.name || profile.username}
              className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">
                {profile.name || profile.username}
              </h1>
              <p className="text-white/90 text-lg mb-2">{subscriber.jobTitle}</p>
              <div className="flex items-center space-x-4">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm">
                  {subscriber.specialization}
                </span>
                <span className="text-white/90">
                  <i className="fas fa-calendar-alt mr-1"></i>
                  Available {availableDays.length} days/week
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">${subscriber.sessionPrice}</div>
              <div className="text-white/90 text-sm">per 60 minutes</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">About</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {subscriber.aboutUser}
                </p>
              </div>

              {/* What You'll Learn */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">What You'll Learn</h2>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {subscriber.offerDescription}
                  </p>
                </div>
              </div>

              {/* Social Links */}
              {(subscriber.xLink || subscriber.linkedInLink) && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Connect</h2>
                  <div className="flex space-x-4">
                    {subscriber.xLink && (
                      <a
                        href={subscriber.xLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <i className="fab fa-twitter mr-2"></i>
                        X/Twitter
                      </a>
                    )}
                    {subscriber.linkedInLink && (
                      <a
                        href={subscriber.linkedInLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                      >
                        <i className="fab fa-linkedin mr-2"></i>
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Action */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-4">Ready to Book?</h3>
                <button
                  onClick={onBook}
                  className="w-full bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent/90 transition-colors"
                >
                  <i className="fas fa-calendar-plus mr-2"></i>
                  Book a Session
                </button>
                <p className="text-sm text-gray-600 mt-3 text-center">
                  60-minute session for ${subscriber.sessionPrice}
                </p>
              </div>

              {/* Availability Schedule */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Availability</h3>
                <div className="space-y-2">
                  {availableDays.length === 0 ? (
                    <p className="text-gray-500 text-sm">No availability set</p>
                  ) : (
                    availableDays.map(({ day, schedule }) => (
                      <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium text-gray-700">{day}</span>
                        <span className="text-sm text-gray-600">
                          {schedule.start} - {schedule.end}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  * Times shown in your local timezone
                </p>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Quick Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session Duration:</span>
                    <span className="font-medium">60 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time:</span>
                    <span className="font-medium">Usually within 24h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking:</span>
                    <span className="font-medium text-green-600">Instant confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}