/**
 * TicketForm Component
 * Form for creating and editing tickets
 * Requirements: 2.1, 2.10, 12.1, 12.6, 15.8
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Button from '../common/Button';
import { ticketSchema } from '../../schemas/ticketSchemas';
import { getUsersByRole } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const TicketForm = ({ ticket = null, onSubmit, onCancel, isLoading = false }) => {
  const { user } = useAuth();
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  const isEditing = !!ticket;
  const canAssign = user?.role === 'Administrator' || user?.role === 'Tehničar';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: ticket?.title || '',
      description: ticket?.description || '',
      priority: ticket?.priority || 'Srednja',
      assigneeId: ticket?.assigneeId || ''
    }
  });

  // Load technicians for assignment dropdown
  useEffect(() => {
    if (canAssign) {
      loadTechnicians();
    }
  }, [canAssign]);

  const loadTechnicians = async () => {
    try {
      setLoadingTechnicians(true);
      const data = await getUsersByRole('Tehničar');
      setTechnicians(data);
    } catch (error) {
      console.error('Failed to load technicians:', error);
    } finally {
      setLoadingTechnicians(false);
    }
  };

  const handleFormSubmit = (data) => {
    // Convert assigneeId to number or null
    const formData = {
      ...data,
      assigneeId: data.assigneeId ? Number(data.assigneeId) : null
    };
    onSubmit(formData);
  };

  const priorityOptions = [
    { value: 'Niska', label: 'Niska' },
    { value: 'Srednja', label: 'Srednja' },
    { value: 'Visoka', label: 'Visoka' },
    { value: 'Hitna', label: 'Hitna' }
  ];

  const technicianOptions = [
    { value: '', label: 'Nije dodijeljen' },
    ...technicians.map(tech => ({
      value: tech.id,
      label: `${tech.firstName} ${tech.lastName}`
    }))
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Title */}
      <Input
        label="Naslov"
        name="title"
        placeholder="Unesite naslov tiketa"
        required
        error={errors.title?.message}
        {...register('title')}
      />

      {/* Description */}
      <Textarea
        label="Opis"
        name="description"
        placeholder="Detaljno opišite problem ili zahtjev"
        rows={6}
        required
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Priority */}
      <Select
        label="Prioritet"
        name="priority"
        options={priorityOptions}
        required
        error={errors.priority?.message}
        {...register('priority')}
      />

      {/* Assignee (only for Tehničar and Administrator) */}
      {canAssign && (
        <Select
          label="Dodijeljen"
          name="assigneeId"
          options={technicianOptions}
          disabled={loadingTechnicians}
          error={errors.assigneeId?.message}
          {...register('assigneeId')}
        />
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
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

export default TicketForm;
