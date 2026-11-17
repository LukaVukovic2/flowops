/**
 * ExternalServiceStatusWidget Component
 * Displays external service status information on the dashboard
 * Only visible for Tehničar and Administrator roles
 * Requirements: 6.4, 7.5, 12.2
 */

import React from 'react';
import { Server, CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

/**
 * Get status color and icon based on service status
 * @param {string} status - Service status (operational, degraded, down)
 * @returns {Object} Color class and icon component
 */
const getStatusInfo = (status) => {
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower.includes('operational') || statusLower.includes('active')) {
    return {
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/30',
      Icon: CheckCircle,
      label: 'Operativno'
    };
  } else if (statusLower.includes('degraded') || statusLower.includes('warning')) {
    return {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500/30',
      Icon: AlertCircle,
      label: 'Smanjena funkcionalnost'
    };
  } else if (statusLower.includes('down') || statusLower.includes('error')) {
    return {
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500/30',
      Icon: XCircle,
      label: 'Nedostupno'
    };
  }
  
  return {
    color: 'text-gray-400',
    bgColor: 'bg-gray-900/20',
    borderColor: 'border-gray-500/30',
    Icon: Clock,
    label: 'Nepoznato'
  };
};

/**
 * Format last checked timestamp in Croatian
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted time
 */
const formatLastChecked = (timestamp) => {
  if (!timestamp) return 'Nepoznato';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    
    if (diffSeconds < 60) {
      return 'Prije manje od minute';
    }
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `Prije ${diffMinutes} min`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `Prije ${diffHours} h`;
    }
    
    // Format as date if more than 24 hours
    return date.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Nepoznato';
  }
};

/**
 * ExternalServiceStatusWidget Component
 * @param {Object} props
 * @param {Array} props.services - Array of external service status objects
 * @param {string} props.services[].name - Service name
 * @param {string} props.services[].status - Service status
 * @param {string} props.services[].lastChecked - Last checked timestamp
 */
const ExternalServiceStatusWidget = ({ services = [] }) => {
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3">
        <Server className="text-primary-400" size={24} />
        <h2 className="text-xl font-semibold text-white">Status vanjskih servisa</h2>
      </div>

      {/* Service List */}
      <div className="divide-y divide-gray-700">
        {services.map((service, index) => {
          const statusInfo = getStatusInfo(service.status);
          const { Icon } = statusInfo;

          return (
            <div
              key={service.name || index}
              className={`px-6 py-4 ${statusInfo.bgColor} transition-colors hover:bg-gray-750`}
            >
              <div className="flex items-center justify-between">
                {/* Service Name and Status */}
                <div className="flex items-center gap-3 flex-1">
                  <Icon className={statusInfo.color} size={20} />
                  <div>
                    <h3 className="text-white font-medium">{service.name}</h3>
                    <p className={`text-sm ${statusInfo.color}`}>
                      {statusInfo.label}
                    </p>
                  </div>
                </div>

                {/* Last Checked Time */}
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    Provjereno:
                  </p>
                  <p className="text-sm text-gray-300">
                    {formatLastChecked(service.lastChecked)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="px-6 py-3 bg-gray-900/50 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Status vanjskih servisa se automatski ažurira svakih 5 minuta
        </p>
      </div>
    </div>
  );
};

export default ExternalServiceStatusWidget;
