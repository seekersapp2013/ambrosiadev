import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface EventFilters {
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
}

interface EventListProps {
  onEventSelect?: (eventId: string) => void;
}

export function EventList({ onEventSelect }: EventListProps) {
  const [filters, setFilters] = useState<EventFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 12;

  // Get events with current filters
  const eventsData = useQuery(api.events.getPublicEvents, {
    limit,
    offset,
    tags: filters.tags,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo
  });

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0);
  }, [filters, searchTerm]);

  const handleLoadMore = () => {
    if (eventsData?.hasMore) {
      setOffset(prev => prev + limit);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined
  ) || searchTerm.trim() !== '';

  // Filter events by search term (client-side)
  const filteredEvents = eventsData?.events.filter(event => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower) ||
      event.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
      event.provider?.subscription?.jobTitle.toLowerCase().includes(searchLower) ||
      event.provider?.subscription?.specialization.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (!eventsData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Search and Filter Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <i className="fas fa-filter mr-2"></i>
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-white text-accent px-2 py-0.5 rounded-full text-xs">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      minPrice: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      maxPrice: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateFrom: e.target.value || undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateTo: e.target.value || undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </span>
            )}
            
            {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
              <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Price: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, minPrice: undefined, maxPrice: undefined }))}
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </span>
            )}

            {(filters.dateFrom || filters.dateTo) && (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Date: {filters.dateFrom || 'Any'} - {filters.dateTo || 'Any'}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, dateFrom: undefined, dateTo: undefined }))}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </span>
            )}
            
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-gray-600">
          {filteredEvents.length === 0 ? (
            'No events found'
          ) : (
            <>
              Showing {filteredEvents.length} events
              {eventsData.total > 0 && ` of ${eventsData.total} total`}
            </>
          )}
        </p>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-calendar-alt text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No events found</h3>
          <p className="text-gray-600 mb-4">
            {hasActiveFilters 
              ? 'Try adjusting your filters or search terms'
              : 'No public events are currently available'
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-accent hover:text-accent/80 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border"
              >
                <div className="p-6">
                  {/* Event Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {event.description}
                    </p>
                  </div>

                  {/* Provider Info */}
                  <div className="flex items-center mb-4">
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
                      <span>{new Date(event.sessionDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-clock w-4 mr-2"></i>
                      <span>{event.sessionTime} ({event.duration} min)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-users w-4 mr-2"></i>
                      <span>{event.availableSpots} spots available</span>
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

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-accent">
                      ${event.pricePerPerson}
                      <span className="text-sm font-normal text-gray-500">/person</span>
                    </div>
                    <button 
                      onClick={() => onEventSelect?.(event._id)}
                      className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm"
                    >
                      Join Event
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {eventsData.hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                Load More Events
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}