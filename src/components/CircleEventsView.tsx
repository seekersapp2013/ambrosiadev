import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { EventCreation } from './EventCreation';
import { EventJoinFlow } from './EventJoinFlow';

interface CircleEventsViewProps {
  circleId: Id<'circles'>;
  onBack: () => void;
}

type ViewMode = 'list' | 'create' | 'join';

export function CircleEventsView({ circleId, onBack }: CircleEventsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedEventId, setSelectedEventId] = useState<Id<'events'> | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');

  // Get circle info
  const circle = useQuery(api.circles.getCircleById, { circleId });
  
  // Get circle events
  const eventsData = useQuery(api.events.getCircleEvents, {
    circleId,
    status: statusFilter === 'all' ? undefined : statusFilter
  });

  // Check if user can create events (admin/moderator/creator)
  const canCreateEvents = circle?.membership && 
    ['CREATOR', 'ADMIN', 'MODERATOR'].includes(circle.membership.role);

  const handleCreateEvent = () => {
    setViewMode('create');
  };

  const handleEventCreated = () => {
    setViewMode('list');
  };

  const handleJoinEvent = (eventId: Id<'events'>) => {
    setSelectedEventId(eventId);
    setViewMode('join');
  };

  const handleJoinSuccess = () => {
    setViewMode('list');
    setSelectedEventId(null);
  };

  const handleCancelJoin = () => {
    setViewMode('list');
    setSelectedEventId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Show create event form
  if (viewMode === 'create') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode('list')}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Create Circle Event</h1>
            </div>
          </div>
        </div>
        <EventCreation
          onBack={() => setViewMode('list')}
          onSuccess={handleEventCreated}
          circleId={circleId}
          isCircleExclusive={true}
        />
      </div>
    );
  }

  // Show join event flow
  if (viewMode === 'join' && selectedEventId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancelJoin}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Join Event</h1>
            </div>
          </div>
        </div>
        <EventJoinFlow
          eventId={selectedEventId}
          onSuccess={handleJoinSuccess}
          onCancel={handleCancelJoin}
        />
      </div>
    );
  }

  // Show events list
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">Circle Events</h1>
              {circle && (
                <p className="text-sm text-gray-600">{circle.name}</p>
              )}
            </div>
            {canCreateEvents && (
              <button
                onClick={handleCreateEvent}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Event
              </button>
            )}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="ACTIVE">Active Events</option>
              <option value="COMPLETED">Past Events</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="all">All Events</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Loading State */}
        {eventsData === undefined && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Empty State */}
        {eventsData && eventsData.events.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-calendar-alt text-2xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'ACTIVE' 
                ? 'No active events in this circle yet'
                : `No ${statusFilter.toLowerCase()} events`
              }
            </p>
            {canCreateEvents && statusFilter === 'ACTIVE' && (
              <button
                onClick={handleCreateEvent}
                className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Create First Event
              </button>
            )}
          </div>
        )}

        {/* Events Grid */}
        {eventsData && eventsData.events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eventsData.events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border overflow-hidden"
              >
                <div className="p-6">
                  {/* Event Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-1">
                      {event.title}
                    </h3>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      event.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      event.status === 'FULL' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Provider Info */}
                  <div className="flex items-center mb-4 pb-4 border-b">
                    <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {event.provider?.profile?.name?.[0] || 
                       event.provider?.subscription?.jobTitle?.[0] || 'P'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">
                        {event.provider?.profile?.name || 'Provider'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {event.provider?.subscription?.jobTitle}
                      </p>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-calendar-alt w-4 mr-2"></i>
                      <span>{formatDate(event.sessionDate)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-clock w-4 mr-2"></i>
                      <span>{formatTime(event.sessionTime)} ({event.duration} min)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-users w-4 mr-2"></i>
                      <span>
                        {event.availableSpots > 0 
                          ? `${event.availableSpots} spots available`
                          : 'Event full'
                        }
                      </span>
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
                          +{event.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price and Action */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-lg font-bold text-accent">
                      {event.priceCurrency && event.priceCurrency !== 'USD' ? (
                        <>{event.priceCurrency} {event.pricePerPerson}</>
                      ) : (
                        <>${event.pricePerPerson}</>
                      )}
                      <span className="text-sm font-normal text-gray-500">/person</span>
                    </div>
                    
                    {event.userHasBooked ? (
                      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                        <i className="fas fa-check-circle mr-1"></i>
                        Joined
                      </div>
                    ) : event.status === 'ACTIVE' && event.availableSpots > 0 ? (
                      <button 
                        onClick={() => handleJoinEvent(event._id)}
                        className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm"
                      >
                        Join Event
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed text-sm"
                      >
                        {event.status === 'FULL' ? 'Full' : 'Unavailable'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {eventsData && eventsData.events.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-gray-800">{eventsData.total}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="bg-white p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-green-600">
                {eventsData.events.filter(e => e.status === 'ACTIVE').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="bg-white p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-blue-600">
                {eventsData.events.filter(e => e.userHasBooked).length}
              </div>
              <div className="text-sm text-gray-600">Joined</div>
            </div>
            <div className="bg-white p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-purple-600">
                {eventsData.events.reduce((sum, e) => sum + e.currentParticipants, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Participants</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
