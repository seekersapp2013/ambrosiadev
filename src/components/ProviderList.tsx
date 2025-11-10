import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ProviderFilters } from '../types/booking';
import { ProviderCard } from './ProviderCard';
import { ProviderFiltersComponent } from './ProviderFilters';

interface ProviderListProps {
  onProviderSelect: (providerId: string) => void;
}

export function ProviderList({ onProviderSelect }: ProviderListProps) {
  const [filters, setFilters] = useState<ProviderFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  // Get providers with current filters
  const providersData = useQuery(api.bookingSubscribers.getProvidersWithPagination, {
    specialization: filters.specialization,
    jobTitle: filters.jobTitle,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    searchTerm: searchTerm.trim() || undefined,
    offset,
    limit
  });

  // Get filter options
  const specializations = useQuery(api.bookingSubscribers.getSpecializations);
  const jobTitles = useQuery(api.bookingSubscribers.getJobTitles);

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0);
  }, [filters, searchTerm]);

  const handleLoadMore = () => {
    if (providersData?.hasMore) {
      setOffset(prev => prev + limit);
    }
  };

  const handleFilterChange = (newFilters: ProviderFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined) || searchTerm.trim() !== '';

  if (!providersData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Search and Filter Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search providers..."
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
          <ProviderFiltersComponent
            filters={filters}
            onFiltersChange={handleFilterChange}
            specializations={specializations || []}
            jobTitles={jobTitles || []}
            onClear={clearFilters}
          />
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
            
            {filters.specialization && (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {filters.specialization}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, specialization: undefined }))}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </span>
            )}
            
            {filters.jobTitle && (
              <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {filters.jobTitle}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, jobTitle: undefined }))}
                  className="ml-2 text-purple-600 hover:text-purple-800"
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
          {providersData.totalCount === 0 ? (
            'No providers found'
          ) : (
            <>
              Showing {Math.min(offset + limit, providersData.totalCount)} of {providersData.totalCount} providers
            </>
          )}
        </p>
      </div>

      {/* Provider Grid */}
      {providersData.providers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-search text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No providers found</h3>
          <p className="text-gray-600 mb-4">
            {hasActiveFilters 
              ? 'Try adjusting your filters or search terms'
              : 'Be the first to offer your services!'
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
            {providersData.providers.map(({ subscriber, profile }) => (
              <ProviderCard
                key={subscriber._id}
                subscriber={subscriber}
                profile={profile}
                onClick={() => onProviderSelect(subscriber.userId)}
              />
            ))}
          </div>

          {/* Load More Button */}
          {providersData.hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                Load More Providers
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}