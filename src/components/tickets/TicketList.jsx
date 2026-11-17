/**
 * TicketList component for displaying a list of tickets with filtering
 */

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import TicketCard from './TicketCard';
import TicketFilters from './TicketFilters';

const TicketList = ({ 
  tickets = [], 
  assignees = [],
  isLoading = false,
  onTicketClick,
  onCreateTicket,
  onFilterChange
}) => {
  const [filters, setFilters] = useState({
    status: '',
    assigneeId: '',
    fromDate: '',
    toDate: ''
  });

  // Notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      assigneeId: '',
      fromDate: '',
      toDate: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tiketi</h1>
          <p className="text-gray-400 mt-2">
            {isLoading ? 'Učitavanje...' : `${tickets.length} tiketa`}
          </p>
        </div>
        {onCreateTicket && (
          <button
            onClick={onCreateTicket}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Novi tiket
          </button>
        )}
      </div>

      {/* Filters */}
      <TicketFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        assignees={assignees}
        onClearFilters={handleClearFilters}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 animate-pulse"
            >
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && tickets.length === 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400 text-lg">Nema tiketa za prikaz</p>
          {onCreateTicket && (
            <button
              onClick={onCreateTicket}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kreiraj prvi tiket
            </button>
          )}
        </div>
      )}

      {/* Ticket list */}
      {!isLoading && tickets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => onTicketClick && onTicketClick(ticket)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
