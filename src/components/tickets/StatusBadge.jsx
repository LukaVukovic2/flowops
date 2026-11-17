/**
 * StatusBadge component for displaying ticket status in Croatian
 */

import React from 'react';

const STATUS_CONFIG = {
  'Nova': {
    label: 'Nova',
    className: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  'U radu': {
    label: 'U radu',
    className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  },
  'Na čekanju': {
    label: 'Na čekanju',
    className: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
  },
  'Riješena': {
    label: 'Riješena',
    className: 'bg-green-500/20 text-green-300 border-green-500/30'
  },
  'Zatvorena': {
    label: 'Zatvorena',
    className: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
};

const PRIORITY_CONFIG = {
  'Niska': {
    label: 'Niska',
    className: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  },
  'Srednja': {
    label: 'Srednja',
    className: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  'Visoka': {
    label: 'Visoka',
    className: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
  },
  'Hitna': {
    label: 'Hitna',
    className: 'bg-red-500/20 text-red-300 border-red-500/30'
  }
};

const StatusBadge = ({ status, priority, type = 'status' }) => {
  const config = type === 'priority' ? PRIORITY_CONFIG : STATUS_CONFIG;
  const value = type === 'priority' ? priority : status;
  const badgeConfig = config[value] || {
    label: value,
    className: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeConfig.className}`}
    >
      {badgeConfig.label}
    </span>
  );
};

export default StatusBadge;
