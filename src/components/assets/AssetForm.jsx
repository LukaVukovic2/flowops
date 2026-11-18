/**
 * AssetForm Component
 * Form for creating and editing IT assets
 * Requirements: 8.1, 8.4, 12.1, 12.6
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Button from '../common/Button';
import { assetSchema } from '../../schemas/assetSchemas';

const AssetForm = ({ asset = null, onSubmit, onCancel, isLoading = false }) => {
  const isEditing = !!asset;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: asset?.name || '',
      type: asset?.type || 'Hardware',
      status: asset?.status || 'Active',
      serialNumber: asset?.serialNumber || '',
      model: asset?.model || '',
      manufacturer: asset?.manufacturer || '',
      location: asset?.location || '',
      purchaseDate: asset?.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
      warrantyExpiry: asset?.warrantyExpiry ? asset.warrantyExpiry.split('T')[0] : '',
      notes: asset?.notes || ''
    }
  });

  const handleFormSubmit = (data) => {
    // Convert empty strings to null for optional fields
    const formData = {
      ...data,
      serialNumber: data.serialNumber || null,
      model: data.model || null,
      manufacturer: data.manufacturer || null,
      location: data.location || null,
      purchaseDate: data.purchaseDate || null,
      warrantyExpiry: data.warrantyExpiry || null,
      notes: data.notes || null
    };
    onSubmit(formData);
  };

  const typeOptions = [
    { value: 'Hardware', label: 'Hardware' },
    { value: 'Software', label: 'Software' },
    { value: 'Network', label: 'Network' },
    { value: 'Peripheral', label: 'Peripheral' }
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Retired', label: 'Retired' }
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
          Osnovne informacije
        </h3>

        {/* Name */}
        <Input
          label="Naziv"
          name="name"
          placeholder="Unesite naziv imovine"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type */}
          <Select
            label="Tip"
            name="type"
            options={typeOptions}
            required
            error={errors.type?.message}
            {...register('type')}
          />

          {/* Status */}
          <Select
            label="Status"
            name="status"
            options={statusOptions}
            required
            error={errors.status?.message}
            {...register('status')}
          />
        </div>
      </div>

      {/* Technical Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
          Tehnički detalji
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Serial Number */}
          <Input
            label="Serijski broj"
            name="serialNumber"
            placeholder="Unesite serijski broj"
            error={errors.serialNumber?.message}
            {...register('serialNumber')}
          />

          {/* Model */}
          <Input
            label="Model"
            name="model"
            placeholder="Unesite model"
            error={errors.model?.message}
            {...register('model')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manufacturer */}
          <Input
            label="Proizvođač"
            name="manufacturer"
            placeholder="Unesite proizvođača"
            error={errors.manufacturer?.message}
            {...register('manufacturer')}
          />

          {/* Location */}
          <Input
            label="Lokacija"
            name="location"
            placeholder="Unesite lokaciju"
            error={errors.location?.message}
            {...register('location')}
          />
        </div>
      </div>

      {/* Purchase and Warranty Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
          Kupovina i garancija
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Purchase Date */}
          <Input
            label="Datum kupovine"
            name="purchaseDate"
            type="date"
            error={errors.purchaseDate?.message}
            {...register('purchaseDate')}
          />

          {/* Warranty Expiry */}
          <Input
            label="Istek garancije"
            name="warrantyExpiry"
            type="date"
            error={errors.warrantyExpiry?.message}
            {...register('warrantyExpiry')}
          />
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
          Dodatne informacije
        </h3>

        {/* Notes */}
        <Textarea
          label="Bilješke"
          name="notes"
          placeholder="Unesite dodatne bilješke"
          rows={4}
          error={errors.notes?.message}
          {...register('notes')}
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Odustani
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          {isEditing ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </form>
  );
};

export default AssetForm;
