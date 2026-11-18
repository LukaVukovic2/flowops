/**
 * AssetStatusBadge component for displaying asset status in Croatian
 * Requirements: 8.3
 */

import React from 'react';

const STATUS_CONFIG = {
  'Active': {
    label: 'Aktivno',
    className: 'bg-green-500/20 text-green-300 border-green-500/30'
  },
  'Inactive': {
    label: 'Neaktivno',
    className: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  },
  'Maintenance': {
    label: 'Održavanje',
    className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  },
  'Retired': {
    label: 'Ukinuto',
    className: 'bg-red-500/20 text-red-300 border-red-500/30'
  }
};

const AssetStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default AssetStatusBadge;
