import React, { useState } from 'react';
import { ProviderFilters } from '../types/booking';

interface ProviderFiltersComponentProps {
  filters: ProviderFilters;
  onFiltersChange: (filters: ProviderFilters) => void;
  specializations: string[];
  jobTitles: string[];
  onClear: () => void;
}

export function ProviderFiltersComponent({
  filters,
  onFiltersChange,
  specializations,
  jobTitles,
  onClear
}: ProviderFiltersComponentProps) {
  const [localFilters, setLocalFilters] = useState<ProviderFilters>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onClear();
  };

  const updateFilter = (key: keyof ProviderFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Specialization Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialization
          </label>
          <select
            value={localFilters.specialization || ''}
            onChange={(e) => updateFilter('specialization', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {/* Job Title Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title
          </label>
          <select
            value={localFilters.jobTitle || ''}
            onChange={(e) => updateFilter('jobTitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All Job Titles</option>
            {jobTitles.map(title => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Price ($)
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={localFilters.minPrice || ''}
            onChange={(e) => updateFilter('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Price ($)
          </label>
          <input
            type="number"
            min="0"
            placeholder="No limit"
            value={localFilters.maxPrice || ''}
            onChange={(e) => updateFilter('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Availability Date Range Filter */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available From
          </label>
          <input
            type="date"
            value={localFilters.availableFrom || ''}
            onChange={(e) => updateFilter('availableFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available To
          </label>
          <input
            type="date"
            value={localFilters.availableTo || ''}
            onChange={(e) => updateFilter('availableTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Clear All
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}