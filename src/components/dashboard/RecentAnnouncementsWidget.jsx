/**
 * RecentAnnouncementsWidget Component
 * Displays 5 most recent published announcements on dashboard
 * Requirements: 6.3, 12.2
 */

import React from 'react';
import { Megaphone, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/dateFormatter.js';
import CategoryBadge from '../announcements/CategoryBadge.jsx';

const RecentAnnouncementsWidget = ({ announcements, loading }) => {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Megaphone className="text-primary-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Nedavne objave</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Megaphone className="text-primary-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Nedavne objave</h2>
        </div>
        <p className="text-gray-400 text-center py-8">
          Nema objavljenih objava.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Megaphone className="text-primary-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Nedavne objave</h2>
        </div>
        <Link
          to="/announcements"
          className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          Sve objave
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.slice(0, 5).map((announcement) => (
          <Link
            key={announcement.id}
            to={`/announcements/${announcement.id}`}
            className="block group"
          >
            <div className="p-4 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors border border-gray-600 hover:border-primary-500">
              {/* Announcement Title */}
              <h3 className="text-white font-medium mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                {announcement.title}
              </h3>

              {/* Announcement Meta */}
              <div className="flex items-center gap-3 text-sm">
                {/* Published Date */}
                <div className="flex items-center gap-1 text-gray-400">
                  <Calendar size={14} />
                  <span>{formatDateTime(announcement.published_at)}</span>
                </div>

                {/* Author */}
                {announcement.author && (
                  <span className="text-gray-500">
                    {announcement.author.first_name && announcement.author.last_name
                      ? `${announcement.author.first_name} ${announcement.author.last_name}`
                      : 'Autor'}
                  </span>
                )}

                {/* Category Badge */}
                {announcement.category && (
                  <CategoryBadge category={announcement.category} size="small" />
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Show link to all announcements if there are more than 5 */}
      {announcements.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-700 text-center">
          <Link
            to="/announcements"
            className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          >
            i još {announcements.length - 5} objava...
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentAnnouncementsWidget;
