/**
 * AssetDetail Component
 * Detailed view of a single asset with linked tickets
 * Requirements: 8.7, 8.9
 */

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Package, Edit, Trash2, 
  Info, FileText, AlertTriangle 
} from 'lucide-react';
import AssetTypeBadge from './AssetTypeBadge';
import AssetStatusBadge from './AssetStatusBadge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import LoadingSkeleton from '../common/LoadingSkeleton';
import TicketCard from '../tickets/TicketCard';
import { formatDate } from '../../utils/dateFormatter';
import { useAuth } from '../../context/AuthContext';
import { getAssetById, deleteAsset, getAssetTickets } from '../../services/assetService';

const AssetDetail = ({ assetId, onClose, onUpdate, onDelete, onEdit, onTicketClick }) => {
  const { user } = useAuth();
  const [asset, setAsset] = useState(null);
  const [linkedTickets, setLinkedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Determine permissions
  const canEdit = user?.role === 'Tehničar' || user?.role === 'Administrator';
  const canDelete = user?.role === 'Administrator';

  useEffect(() => {
    loadAsset();
    loadLinkedTickets();
  }, [assetId]);

  const loadAsset = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssetById(assetId);
      setAsset(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri učitavanju imovine');
      console.error('Failed to load asset:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLinkedTickets = async () => {
    try {
      setTicketsLoading(true);
      const tickets = await getAssetTickets(assetId);
      setLinkedTickets(Array.isArray(tickets) ? tickets : tickets.tickets || []);
    } catch (err) {
      console.error('Failed to load linked tickets:', err);
      setLinkedTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteAsset(assetId);
      setIsDeleteModalOpen(false);
      if (onDelete) onDelete(assetId);
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri brisanju imovine');
      console.error('Failed to delete asset:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Check warranty status
  const warrantyExpiry = asset?.warrantyExpiry ? new Date(asset.warrantyExpiry) : null;
  const isWarrantyExpired = warrantyExpiry && warrantyExpiry < new Date();
  const isWarrantyExpiringSoon = warrantyExpiry && 
    !isWarrantyExpired && 
    warrantyExpiry <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  if (loading) {
    return <LoadingSkeleton variant="asset-detail" />;
  }

  if (error || !asset) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
        {error || 'Imovina nije pronađena'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{asset.name}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <AssetTypeBadge type={asset.type} />
              <AssetStatusBadge status={asset.status} />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => onEdit && onEdit(asset)}
              >
                <Edit size={16} className="mr-1" />
                Uredi
              </Button>
            )}
            {canDelete && (
              <Button
                variant="danger"
                size="small"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 size={16} className="mr-1" />
                Obriši
              </Button>
            )}
          </div>
        </div>

        {/* Warranty Warning */}
        {(isWarrantyExpired || isWarrantyExpiringSoon) && (
          <div className={`flex items-start gap-2 p-3 rounded-lg mb-4 ${
            isWarrantyExpired 
              ? 'bg-red-900/20 border border-red-700 text-red-400'
              : 'bg-yellow-900/20 border border-yellow-700 text-yellow-400'
          }`}>
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">
                {isWarrantyExpired ? 'Garancija je istekla' : 'Garancija uskoro ističe'}
              </p>
              <p className="text-sm mt-1">
                Datum isteka: {formatDate(asset.warrantyExpiry)}
              </p>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manufacturer and Model */}
          {(asset.manufacturer || asset.model) && (
            <div className="flex items-start gap-2">
              <Package size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Proizvođač / Model</p>
                <p className="text-white">
                  {asset.manufacturer && asset.model 
                    ? `${asset.manufacturer} ${asset.model}`
                    : asset.manufacturer || asset.model}
                </p>
              </div>
            </div>
          )}

          {/* Serial Number */}
          {asset.serialNumber && (
            <div className="flex items-start gap-2">
              <Info size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Serijski broj</p>
                <p className="text-white font-mono">{asset.serialNumber}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {asset.location && (
            <div className="flex items-start gap-2">
              <MapPin size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Lokacija</p>
                <p className="text-white">{asset.location}</p>
              </div>
            </div>
          )}

          {/* Purchase Date */}
          {asset.purchaseDate && (
            <div className="flex items-start gap-2">
              <Calendar size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Datum kupnje</p>
                <p className="text-white">{formatDate(asset.purchaseDate)}</p>
              </div>
            </div>
          )}

          {/* Warranty Expiry */}
          {asset.warrantyExpiry && (
            <div className="flex items-start gap-2">
              <Calendar size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Istek garancije</p>
                <p className={`font-medium ${
                  isWarrantyExpired 
                    ? 'text-red-400' 
                    : isWarrantyExpiringSoon 
                      ? 'text-yellow-400'
                      : 'text-white'
                }`}>
                  {formatDate(asset.warrantyExpiry)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {asset.notes && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-gray-400" />
            <h3 className="text-lg font-semibold text-white">Napomene</h3>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{asset.notes}</p>
        </div>
      )}

      {/* Linked Tickets */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Povezani tiketi</h3>
          <span className="text-sm text-gray-400">
            {linkedTickets.length} {linkedTickets.length === 1 ? 'tiket' : 'tiketa'}
          </span>
        </div>

        {ticketsLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <LoadingSkeleton key={i} className="h-32" />
            ))}
          </div>
        ) : linkedTickets.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            Nema povezanih tiketa za ovu imovinu
          </p>
        ) : (
          <div className="space-y-3">
            {linkedTickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => onTicketClick && onTicketClick(ticket)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Kreirano</p>
            <p className="text-white">{formatDate(asset.createdAt)}</p>
          </div>
          {asset.updatedAt && asset.updatedAt !== asset.createdAt && (
            <div>
              <p className="text-gray-400">Ažurirano</p>
              <p className="text-white">{formatDate(asset.updatedAt)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Potvrda brisanja"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={actionLoading}
            >
              Odustani
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={actionLoading}
              disabled={actionLoading}
            >
              Obriši
            </Button>
          </>
        }
      >
        <p className="text-gray-300">
          Jeste li sigurni da želite obrisati ovu imovinu? Ova radnja se ne može poništiti.
        </p>
        {linkedTickets.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-400 text-sm">
              <AlertTriangle size={16} className="inline mr-1" />
              Ova imovina ima {linkedTickets.length} povezan{linkedTickets.length === 1 ? '' : 'ih'} tiket{linkedTickets.length === 1 ? '' : 'a'}.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssetDetail;
