/**
 * AssetCard component for displaying individual asset in list view
 * Requirements: 8.9
 */

import React from 'react';
import { MapPin, Calendar, Package } from 'lucide-react';
import AssetTypeBadge from './AssetTypeBadge';
import AssetStatusBadge from './AssetStatusBadge';
import { formatDate } from '../../utils/dateFormatter';

const AssetCard = ({ asset, onClick }) => {
  const {
    id,
    name,
    type,
    status,
    serialNumber,
    model,
    manufacturer,
    location,
    purchaseDate,
    warrantyExpiry
  } = asset;

  // Check if warranty is expired or expiring soon
  const isWarrantyExpiringSoon = warrantyExpiry && 
    new Date(warrantyExpiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isWarrantyExpired = warrantyExpiry && 
    new Date(warrantyExpiry) < new Date();

  return (
    <div
      onClick={onClick}
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
    >
      {/* Header with name and badges */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-medium text-white flex-1 line-clamp-2">
          {name}
        </h3>
        <div className="flex flex-col gap-1">
          <AssetTypeBadge type={type} />
          <AssetStatusBadge status={status} />
        </div>
      </div>

      {/* Asset details */}
      <div className="space-y-2 text-sm text-gray-400">
        {/* Manufacturer and Model */}
        {(manufacturer || model) && (
          <div className="flex items-center gap-2">
            <Package size={14} />
            <span>
              {manufacturer && model ? `${manufacturer} ${model}` : manufacturer || model}
            </span>
          </div>
        )}

        {/* Serial Number */}
        {serialNumber && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-gray-700 px-2 py-0.5 rounded">
              SN: {serialNumber}
            </span>
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{location}</span>
          </div>
        )}

        {/* Purchase Date */}
        {purchaseDate && (
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>Kupljeno: {formatDate(purchaseDate)}</span>
          </div>
        )}

        {/* Warranty */}
        {warrantyExpiry && (
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span className={
              isWarrantyExpired 
                ? 'text-red-400' 
                : isWarrantyExpiringSoon 
                  ? 'text-yellow-400' 
                  : ''
            }>
              Garancija: {formatDate(warrantyExpiry)}
              {isWarrantyExpired && ' (istekla)'}
              {!isWarrantyExpired && isWarrantyExpiringSoon && ' (uskoro ističe)'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetCard;
