
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { EventWithDetails } from '../types/booking';

interface EventCardProps {
  event: EventWithDetails;
  onSelect?: (eventId: string) => void;
}

export function EventCard({ event: eventWithDetails, onSelect }: EventCardProps) {
  const event = eventWithDetails.event;
  const provider = eventWithDetails.provider;
  
  // Get provider avatar
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    provider.avatar ? { storageId: provider.avatar } : "skip"
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getStatusColor = () => {
    if (event.status === 'FULL') return 'bg-red-100 text-red-800';
    if (eventWithDetails.availableSpots <= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = () => {
    if (event.status === 'FULL') return 'Full';
    if (eventWithDetails.availableSpots <= 2) return `${eventWithDetails.availableSpots} spots left`;
    return `${eventWithDetails.availableSpots} spots available`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => onSelect?.(event._id)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-800 line-clamp-2">{event.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{event.description}</p>

        {/* Provider Info */}
        <div className="flex items-center space-x-2">
          <img
            src={avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
            alt={provider.name || provider.username}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-sm text-gray-600">
            {provider.name || provider.username}
          </span>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-4">
        <div className="space-y-2 mb-4">
          {/* Date & Time */}
          <div className="flex items-center text-sm text-gray-600">
            <i className="fas fa-calendar-alt w-4 mr-2"></i>
            <span>{formatDate(event.sessionDate)} at {formatTime(event.sessionTime)}</span>
          </div>

          {/* Duration */}
          <div className="flex items-center text-sm text-gray-600">
            <i className="fas fa-clock w-4 mr-2"></i>
            <span>{formatDuration(event.duration)}</span>
          </div>

          {/* Participants */}
          <div className="flex items-center text-sm text-gray-600">
            <i className="fas fa-users w-4 mr-2"></i>
            <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {event.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{event.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-accent">
            ${event.pricePerPerson}
            <span className="text-sm font-normal text-gray-600"> per person</span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(event._id);
            }}
            disabled={event.status === 'FULL'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              event.status === 'FULL'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-accent text-white hover:bg-accent/90'
            }`}
          >
            {event.status === 'FULL' ? 'Full' : 'Join Event'}
          </button>
        </div>
      </div>
    </div>
  );
}