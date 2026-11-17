/**
 * TicketHistory Component
 * Displays timeline of ticket changes
 * Requirements: 2.6, 2.7, 12.2
 */

import React, { useState, useEffect } from 'react';
import { Clock, User, FileText, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/dateFormatter';
import { getTicketHistory } from '../../services/ticketService';

const TicketHistory = ({ ticketId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [ticketId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTicketHistory(ticketId);
      // Handle both array response and object with history property
      const historyData = Array.isArray(response) ? response : response.history || [];
      setHistory(historyData);
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri učitavanju povijesti');
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (action) => {
    if (action.includes('status')) {
      return <AlertCircle size={16} className="text-blue-400" />;
    }
    if (action.includes('assign')) {
      return <User size={16} className="text-green-400" />;
    }
    return <FileText size={16} className="text-gray-400" />;
  };

  const formatActionDescription = (entry) => {
    const action = entry.action;
    const oldValue = entry.old_value;
    const newValue = entry.new_value;

    if (action === 'created') {
      return 'Tiket kreiran';
    }
    
    if (action === 'status_changed') {
      return (
        <>
          <span className="font-medium">Status</span>
          {' promijenjen iz '}
          <span className="text-red-400">{formatValue(oldValue)}</span>
          {' u '}
          <span className="text-green-400">{formatValue(newValue)}</span>
        </>
      );
    }

    if (action === 'assigned') {
      return (
        <>
          <span className="font-medium">Dodijeljeno</span>
          {' promijenjeno iz '}
          <span className="text-red-400">{formatValue(oldValue)}</span>
          {' u '}
          <span className="text-green-400">{formatValue(newValue)}</span>
        </>
      );
    }

    if (action.startsWith('updated_')) {
      const field = action.replace('updated_', '');
      const fieldNames = {
        title: 'Naslov',
        description: 'Opis',
        priority: 'Prioritet',
        assignee: 'Dodijeljeno',
        asset: 'Imovina'
      };
      const fieldLabel = fieldNames[field] || field;
      
      return (
        <>
          <span className="font-medium">{fieldLabel}</span>
          {' promijenjen iz '}
          <span className="text-red-400">{formatValue(oldValue)}</span>
          {' u '}
          <span className="text-green-400">{formatValue(newValue)}</span>
        </>
      );
    }

    return `${action}: ${oldValue} → ${newValue}`;
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '' || value === 'null') {
      return 'Nije postavljeno';
    }
    return value;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Povijest promjena</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Povijest promjena</h3>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Povijest promjena</h3>
      
      {history.length === 0 ? (
        <p className="text-gray-400 text-center py-4">Nema zabilježenih promjena</p>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="relative pl-8 pb-4 border-l-2 border-gray-700 last:border-l-0 last:pb-0"
            >
              {/* Icon */}
              <div className="absolute left-0 top-0 -translate-x-[9px] bg-gray-800 p-1">
                {getChangeIcon(entry.action)}
              </div>

              {/* Content */}
              <div className="space-y-1">
                {/* Change description */}
                <div className="text-gray-300">
                  {formatActionDescription(entry)}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {entry.user && (
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span>
                        {entry.user.first_name} {entry.user.last_name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{formatDateTime(entry.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketHistory;
