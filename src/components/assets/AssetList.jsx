/**
 * AssetList component for displaying list of assets
 * Requirements: 8.9
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import AssetCard from './AssetCard';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import LoadingSkeleton from '../common/LoadingSkeleton';
import Pagination from '../common/Pagination';
import { getAssets } from '../../services/assetService';

const AssetList = ({ onAssetClick, onCreateClick }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    location: '',
    search: ''
  });

  useEffect(() => {
    loadAssets();
  }, [page, filters.type, filters.status]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssets({
        page,
        limit: 20,
        type: filters.type || undefined,
        status: filters.status || undefined
      });
      
      // Handle both array and paginated response formats
      if (Array.isArray(data)) {
        setAssets(data);
        setTotalPages(1);
      } else {
        setAssets(data.assets || data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri učitavanju imovine');
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadAssets();
  };

  const typeOptions = [
    { value: '', label: 'Svi tipovi' },
    { value: 'Hardware', label: 'Hardware' },
    { value: 'Software', label: 'Software' },
    { value: 'Network', label: 'Mreža' },
    { value: 'Peripheral', label: 'Periferija' }
  ];

  const statusOptions = [
    { value: '', label: 'Svi statusi' },
    { value: 'Active', label: 'Aktivno' },
    { value: 'Inactive', label: 'Neaktivno' },
    { value: 'Maintenance', label: 'Održavanje' },
    { value: 'Retired', label: 'Ukinuto' }
  ];

  // Filter assets locally by search term
  const filteredAssets = filters.search
    ? assets.filter(asset =>
        asset.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
        asset.location?.toLowerCase().includes(filters.search.toLowerCase())
      )
    : assets;

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Imovina</h2>
        {onCreateClick && (
          <Button variant="primary" onClick={onCreateClick}>
            <Plus size={20} className="mr-2" />
            Nova imovina
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="Pretraži po imenu, SN ili lokaciji..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              icon={<Search size={18} />}
            />
          </div>

          {/* Type Filter */}
          <div>
            <Select
              name="type"
              options={typeOptions}
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select
              name="status"
              options={statusOptions}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <LoadingSkeleton key={i} className="h-48" />
          ))}
        </div>
      )}

      {/* Asset List */}
      {!loading && !error && (
        <>
          {filteredAssets.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-400">Nema pronađene imovine</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map(asset => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onClick={() => onAssetClick && onAssetClick(asset)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AssetList;
