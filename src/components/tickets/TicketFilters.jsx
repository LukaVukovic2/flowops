/**
 * TicketFilters component for filtering tickets by status, assignee, and date range
 */

import React from 'react';
import { X } from 'lucide-react';

const TicketFilters = ({ 
  filters = {}, 
  onFilterChange, 
  assignees = [],
  onClearFilters 
}) => {
  const handleStatusChange = (e) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  const handleAssigneeChange = (e) => {
    onFilterChange({ ...filters, assigneeId: e.target.value });
  };

  const handleFromDateChange = (e) => {
    onFilterChange({ ...filters, fromDate: e.target.value });
  };

  const handleToDateChange = (e) => {
    onFilterChange({ ...filters, toDate: e.target.value });
  };

  const hasActiveFilters = () => {
    return filters.status || filters.assigneeId || filters.fromDate || filters.toDate;
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Svi statusi</option>
            <option value="Nova">Nova</option>
            <option value="U radu">U radu</option>
            <option value="Na čekanju">Na čekanju</option>
            <option value="Riješena">Riješena</option>
            <option value="Zatvorena">Zatvorena</option>
          </select>
        </div>

        {/* Assignee filter */}
        <div>
          <label htmlFor="assignee-filter" className="block text-sm font-medium text-gray-300 mb-2">
            Dodijeljen
          </label>
          <select
            id="assignee-filter"
            value={filters.assigneeId || ''}
            onChange={handleAssigneeChange}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Svi korisnici</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.firstName} {assignee.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* From date filter */}
        <div>
          <label htmlFor="from-date-filter" className="block text-sm font-medium text-gray-300 mb-2">
            Od datuma
          </label>
          <input
            type="date"
            id="from-date-filter"
            value={filters.fromDate || ''}
            onChange={handleFromDateChange}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* To date filter */}
        <div>
          <label htmlFor="to-date-filter" className="block text-sm font-medium text-gray-300 mb-2">
            Do datuma
          </label>
          <input
            type="date"
            id="to-date-filter"
            value={filters.toDate || ''}
            onChange={handleToDateChange}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default TicketFilters;
