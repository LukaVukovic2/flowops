/**
 * AssetFilters Component
 * Filter component for filtering assets by type, status, and location
 * Requirements: 8.8, 8.10, 12.1, 17.3
 */

import React from 'react';
import { X } from 'lucide-react';

const AssetFilters = ({ 
  filters = {}, 
  onFilterChange, 
  locations = [],
  onClearFilters 
}) => {
  const handleTypeChange = (e) => {
    onFilterChange({ ...filters, type: e.target.value });
  };

  const handleStatusChange = (e) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  const handleLocationChange = (e) => {
    onFilterChange({ ...filters, location: e.target.value });
  };

  const hasActiveFilters = () => {
    return filters.type || filters.status || filters.location;
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Filteri</h3>
        {hasActiveFilters() && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
            Očisti filtere
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Type filter */}
        <div>
          <label 
            htmlFor="type-filter" 
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Tip
          </label>
          <select
            id="type-filter"
            value={filters.type || ''}
            onChange={handleTypeChange}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Svi tipovi</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Network">Network</option>
            <option value="Peripheral">Peripheral</option>
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label 
            htmlFor="status-filter" 
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Svi statusi</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        {/* Location filter */}
        <div>
          <label 
            htmlFor="location-filter" 
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Lokacija
          </label>
          {locations.length > 0 ? (
            <select
              id="location-filter"
              value={filters.location || ''}
              onChange={handleLocationChange}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sve lokacije</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              id="location-filter"
              value={filters.location || ''}
              onChange={handleLocationChange}
              placeholder="Filtriraj po lokaciji"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetFilters;
