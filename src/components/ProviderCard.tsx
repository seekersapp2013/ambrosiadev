import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { BookingSubscriber } from '../types/booking';

interface ProviderCardProps {
  subscriber: BookingSubscriber;
  profile: {
    name?: string;
    username: string;
    avatar?: string;
  } | null;
  onClick: () => void;
}

export function ProviderCard({ subscriber, profile, onClick }: ProviderCardProps) {
  // Get avatar URL if available
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    profile?.avatar ? { storageId: profile.avatar } : "skip"
  );

  // Calculate available days count
  const availableDays = Object.values(subscriber.openHours).filter(day => day.available).length;

  // Truncate text for preview
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
    >
      {/* Header with Avatar and Basic Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start space-x-3">
          <img
            src={avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
            alt={profile?.name || profile?.username || 'Provider'}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">
              {profile?.name || profile?.username || 'Provider'}
            </h3>
            <p className="text-sm text-gray-600 truncate">{subscriber.jobTitle}</p>
            <div className="flex items-center mt-1">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {subscriber.specialization}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* About Preview */}
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
          {truncateText(subscriber.aboutUser, 120)}
        </p>

        {/* Offer Preview */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-800 mb-1">What you'll learn:</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {truncateText(subscriber.offerDescription, 100)}
          </p>
        </div>

        {/* Availability Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="flex items-center">
            <i className="fas fa-calendar-alt mr-1"></i>
            Available {availableDays} day{availableDays !== 1 ? 's' : ''}/week
          </span>
        </div>

        {/* Social Links */}
        {(subscriber.xLink || subscriber.linkedInLink) && (
          <div className="flex items-center space-x-3 mb-3">
            {subscriber.xLink && (
              <a
                href={subscriber.xLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="X/Twitter"
              >
                <i className="fab fa-twitter"></i>
              </a>
            )}
            {subscriber.linkedInLink && (
              <a
                href={subscriber.linkedInLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-blue-700 transition-colors"
                title="LinkedIn"
              >
                <i className="fab fa-linkedin"></i>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer with Price and Action */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-accent">${subscriber.oneOnOnePrice}</span>
            <span className="text-sm text-gray-500 ml-1">/60 min</span>
          </div>
          <button className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/90 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}