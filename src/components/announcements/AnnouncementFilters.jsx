/**
 * AnnouncementFilters Component
 * Filtering controls for announcements by category and author
 * Requirements: 17.2, 12.1
 */

import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import Select from '../common/Select';
import Button from '../common/Button';
import { getCategories } from '../../services/announcementService';
import { getUsersByRole } from '../../services/userService';

const AnnouncementFilters = ({ onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingAuthors, setLoadingAuthors] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    categoryId: '',
    authorId: ''
  });

  useEffect(() => {
    loadCategories();
    loadAuthors();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadAuthors = async () => {
    try {
      setLoadingAuthors(true);
      // Get Tehničar and Administrator who can create announcements
      const [technicians, admins] = await Promise.all([
        getUsersByRole('Tehničar'),
        getUsersByRole('Administrator')
      ]);
      
      // Combine and deduplicate by ID
      const allAuthors = [...technicians, ...admins];
      const uniqueAuthors = allAuthors.filter(
        (author, index, self) => 
          index === self.findIndex(a => a.id === author.id)
      );
      
      setAuthors(uniqueAuthors);
    } catch (error) {
      console.error('Failed to load authors:', error);
    } finally {
      setLoadingAuthors(false);
    }
  };

  const handleFilterChange = (name, value) => {
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);

    // Send only non-empty filters to parent
    const activeFilters = {};
    if (newFilters.categoryId) activeFilters.categoryId = newFilters.categoryId;
    if (newFilters.authorId) activeFilters.authorId = newFilters.authorId;
    
    onFilterChange?.(activeFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      categoryId: '',
      authorId: ''
    };
    setFilters(clearedFilters);
    onFilterChange?.({});
  };

  const hasActiveFilters = filters.categoryId || filters.authorId;

  const categoryOptions = [
    { value: '', label: 'Sve kategorije' },
    ...categories.map(cat => ({
      value: cat.id,
      label: cat.name
    }))
  ];

  const authorOptions = [
    { value: '', label: 'Svi autori' },
    ...authors.map(author => ({
      value: author.id,
      label: `${author.firstName} ${author.lastName}`
    }))
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-white font-medium hover:text-blue-400 transition-colors"
        >
          <Filter size={20} />
          <span>Filteri</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
              {[filters.categoryId, filters.authorId].filter(Boolean).length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="small"
            onClick={handleClearFilters}
          >
            <X size={16} className="mr-1" />
            Očisti filtere
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Kategorija
            </label>
            <select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              disabled={loadingCategories}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Author Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Autor
            </label>
            <select
              value={filters.authorId}
              onChange={(e) => handleFilterChange('authorId', e.target.value)}
              disabled={loadingAuthors}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authorOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementFilters;
