/**
 * AnnouncementCard Component
 * Card display for announcement with image, category, and formatted date
 * Requirements: 3.3, 3.9, 3.10, 12.2
 */

import React from 'react';
import { Calendar, User } from 'lucide-react';
import { formatDateTime } from '../../utils/dateFormatter.js';
import CategoryBadge from './CategoryBadge.jsx';

const AnnouncementCard = ({ announcement, onClick }) => {
  const {
    id,
    title,
    content,
    imageUrl,
    category,
    author,
    publishedAt,
    createdAt
  } = announcement;

  // Use publishedAt if available, otherwise createdAt
  const displayDate = publishedAt || createdAt;

  // Truncate content for preview (first 150 characters)
  const contentPreview = content.length > 150 
    ? content.substring(0, 150) + '...' 
    : content;

  return (
    <article 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-700"
      onClick={() => onClick?.(id)}
    >
      {/* Image */}
      {imageUrl && (
        <div className="w-full h-48 overflow-hidden bg-gray-700">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Category Badge */}
        {category && (
          <div className="mb-3">
            <CategoryBadge category={category} size="small" />
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-3 hover:text-blue-400 transition-colors">
          {title}
        </h3>

        {/* Content Preview */}
        <p className="text-gray-300 mb-4 line-clamp-3">
          {contentPreview}
        </p>

        {/* Meta Information */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          {/* Published Date */}
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{formatDateTime(displayDate)}</span>
          </div>

          {/* Author */}
          {author && (
            <div className="flex items-center gap-1">
              <User size={16} />
              <span>
                {author.firstName && author.lastName 
                  ? `${author.firstName} ${author.lastName}`
                  : author.email}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default AnnouncementCard;
