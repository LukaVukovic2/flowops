/**
 * AssetTypeBadge component for displaying asset type in Croatian
 * Requirements: 8.2
 */

import React from 'react';
import { Monitor, HardDrive, Network, Printer } from 'lucide-react';

const TYPE_CONFIG = {
  'Hardware': {
    label: 'Hardware',
    className: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: HardDrive
  },
  'Software': {
    label: 'Software',
    className: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: Monitor
  },
  'Network': {
    label: 'Mreža',
    className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon: Network
  },
  'Peripheral': {
    label: 'Periferija',
    className: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    icon: Printer
  }
};

const AssetTypeBadge = ({ type }) => {
  const config = TYPE_CONFIG[type] || {
    label: type,
    className: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    icon: HardDrive
  };
  
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
};

export default AssetTypeBadge;
