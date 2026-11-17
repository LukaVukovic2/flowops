/**
 * TicketStatsCard Component
 * Displays ticket statistics broken down by status
 * Requirements: 6.2, 12.1
 */

import React from 'react';
import { Ticket, Clock, PlayCircle, PauseCircle, CheckCircle, XCircle } from 'lucide-react';
import Badge from '../common/Badge';

const TicketStatsCard = ({ ticketStats }) => {
  if (!ticketStats) {
    return null;
  }

  const { total, byStatus } = ticketStats;

  // Status configurations with Croatian labels and colors
  const statusConfig = {
    'Nova': { 
      label: 'Nova', 
      color: 'blue', 
      icon: Clock 
    },
    'U radu': { 
      label: 'U radu', 
      color: 'yellow', 
      icon: PlayCircle 
    },
    'Na čekanju': { 
      label: 'Na čekanju', 
      color: 'orange', 
      icon: PauseCircle 
    },
    'Riješena': { 
      label: 'Riješena', 
      color: 'green', 
      icon: CheckCircle 
    },
    'Zatvorena': { 
      label: 'Zatvorena', 
      color: 'gray', 
      icon: XCircle 
    }
  };

  return (
    <div className="border border-gray-700 bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
            Tiketi
          </p>
          <p className="text-3xl font-bold text-white">
            {total}
          </p>
        </div>
        <div className="text-primary-400 opacity-80">
          <Ticket size={32} strokeWidth={1.5} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Po statusu
        </p>
        {Object.entries(byStatus).map(([status, count]) => {
          const config = statusConfig[status];
          if (!config) return null;

          const StatusIcon = config.icon;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={status} className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0">
              <div className="flex items-center gap-3 flex-1">
                <StatusIcon size={16} className="text-gray-400" />
                <span className="text-sm text-gray-300">
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${config.color}-500 transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-white min-w-[2rem] text-right">
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TicketStatsCard;
