/**
 * AnnouncementForm Component
 * Form for creating and editing announcements with validation
 * Requirements: 3.1, 3.4, 3.5, 3.6, 12.1, 12.6
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Button from '../common/Button';
import { announcementSchema } from '../../schemas/announcementSchemas';
import { getCategories } from '../../services/announcementService';
import { ImagePlus } from 'lucide-react';

const AnnouncementForm = ({ announcement = null, onSubmit, onCancel, isLoading = false }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [imagePreview, setImagePreview] = useState(announcement?.imageUrl || '');

  const isEditing = !!announcement;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: announcement?.title || '',
      content: announcement?.content || '',
      categoryId: announcement?.categoryId || '',
      imageUrl: announcement?.imageUrl || ''
    }
  });

  // Watch imageUrl for preview
  const imageUrl = watch('imageUrl');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    // Update image preview when imageUrl changes
    if (imageUrl && imageUrl.trim() !== '') {
      setImagePreview(imageUrl);
    } else {
      setImagePreview('');
    }
  }, [imageUrl]);

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

  const handleFormSubmit = (data) => {
    // Clean up empty strings to null
    const formData = {
      ...data,
      categoryId: data.categoryId || null,
      imageUrl: data.imageUrl || null
    };
    onSubmit(formData);
  };

  const categoryOptions = [
    { value: '', label: 'Bez kategorije' },
    ...categories.map(cat => ({
      value: cat.id,
      label: cat.name
    }))
  ];

  const handleImageError = () => {
    setImagePreview('');
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title */}
      <Input
        label="Naslov"
        name="title"
        placeholder="Unesite naslov objave"
        required
        error={errors.title?.message}
        {...register('title')}
      />

      {/* Content */}
      <Textarea
        label="Sadržaj"
        name="content"
        placeholder="Unesite sadržaj objave"
        rows={12}
        required
        error={errors.content?.message}
        {...register('content')}
      />

      {/* Category */}
      <Select
        label="Kategorija"
        name="categoryId"
        options={categoryOptions}
        disabled={loadingCategories}
        error={errors.categoryId?.message}
        {...register('categoryId')}
      />

      {/* Image URL */}
      <div className="space-y-2">
        <Input
          label="URL slike"
          name="imageUrl"
          placeholder="https://example.com/image.jpg"
          error={errors.imageUrl?.message}
          {...register('imageUrl')}
        />
        <p className="text-xs text-gray-400">
          Podržani formati: JPG, PNG, GIF, WebP. Maksimalna veličina: 10MB
        </p>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pregled slike
            </label>
            <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
          </div>
        )}

        {/* No Image Placeholder */}
        {!imagePreview && (
          <div className="mt-3">
            <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <ImagePlus size={48} className="mx-auto mb-2" />
                <p className="text-sm">Nema slike</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 text-blue-300 text-sm">
        <p className="font-medium mb-1">Napomena:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-400">
          <li>Objava će biti spremljena kao skica</li>
          <li>Možete je objaviti nakon što je spremite</li>
          <li>Objavljene objave bit će vidljive svim korisnicima</li>
        </ul>
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
          {isEditing ? 'Spremi promjene' : 'Kreiraj objavu'}
        </Button>
      </div>
    </form>
  );
};

export default AnnouncementForm;
