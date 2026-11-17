/**
 * TicketCard component for displaying individual ticket in list view
 */

import React from 'react';
import { Clock, User } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDateTime } from '../../utils/dateFormatter';

const TicketCard = ({ ticket, onClick }) => {
  const {
    id,
    title,
    status,
    priority,
    createdAt,
    updatedAt,
    creator,
    assignee
  } = ticket;

  return (
    <div
      onClick={onClick}
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
    >
      {/* Header with title and status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-medium text-white flex-1 line-clamp-2">
          {title}
        </h3>
        <StatusBadge status={status} />
      </div>

      {/* Priority badge */}
      {priority && (
        <div className="mb-3">
          <StatusBadge priority={priority} type="priority" />
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-2 text-sm text-gray-400">
        {/* Creator */}
        {creator && (
          <div className="flex items-center gap-2">
            <User size={14} />
            <span>Kreirao: {creator.firstName} {creator.lastName}</span>
          </div>
        )}

        {/* Assignee */}
        {assignee && (
          <div className="flex items-center gap-2">
            <User size={14} />
            <span>Dodijeljen: {assignee.firstName} {assignee.lastName}</span>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-center gap-2">
          <Clock size={14} />
          <span>Kreirano: {formatDateTime(createdAt)}</span>
        </div>

        {updatedAt && updatedAt !== createdAt && (
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>Ažurirano: {formatDateTime(updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
