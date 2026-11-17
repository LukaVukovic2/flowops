/**
 * TicketComments Component
 * Comments section with list and form
 * Requirements: 2.6, 2.7, 2.9, 12.2
 */

import React, { useState, useEffect } from 'react';
import { User, Clock, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { commentSchema } from '../../schemas/ticketSchemas';
import { formatDateTime } from '../../utils/dateFormatter';
import { getTicketComments, addTicketComment } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';

const TicketComments = ({ ticketId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: ''
    }
  });

  useEffect(() => {
    loadComments();
  }, [ticketId, page]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTicketComments(ticketId, page);
      
      // Handle both direct array and paginated response
      const commentsData = data.comments || data;
      const paginationData = data.pagination || {};
      
      if (page === 1) {
        setComments(commentsData);
      } else {
        setComments(prev => [...prev, ...commentsData]);
      }
      
      // Check if there are more pages
      setHasMore(paginationData.page < paginationData.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri učitavanju komentara');
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);
      const newComment = await addTicketComment(ticketId, formData.content);
      
      // Add new comment to the top of the list
      setComments(prev => [newComment, ...prev]);
      reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri dodavanju komentara');
      console.error('Failed to add comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Komentari ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit(handleAddComment)} className="mb-6">
        <Textarea
          name="content"
          placeholder="Napišite komentar..."
          rows={3}
          error={errors.content?.message}
          {...register('content')}
        />
        <div className="flex justify-end mt-2">
          <Button
            type="submit"
            variant="primary"
            size="small"
            loading={submitting}
            disabled={submitting}
          >
            <Send size={16} className="mr-1" />
            Dodaj komentar
          </Button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Comments List */}
      {loading && page === 1 ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-400 text-center py-4">Nema komentara</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
            >
              {/* Comment Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-gray-400" />
                  <span className="text-gray-300 font-medium">
                    {comment.author?.first_name || comment.author?.firstName} {comment.author?.last_name || comment.author?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>{formatDateTime(comment.created_at || comment.createdAt)}</span>
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="small"
                onClick={loadMore}
                loading={loading && page > 1}
                disabled={loading}
              >
                Učitaj više
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketComments;
