/**
 * DashboardPage Component
 * Main dashboard displaying IT operations overview with statistics
 * Role-based content rendering:
 * - Posjetitelj: Public data only (published announcements)
 * - Registrirani_Korisnik: Own tickets + published announcements
 * - Tehničar/Administrator: Full statistics and external service status
 * Requirements: 6.1, 6.2, 6.7, 6.8, 6.9, 15.8
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Megaphone, 
  HardDrive, 
  RefreshCw,
  AlertCircle,
  Server
} from 'lucide-react';
import { getDashboardStats, getRecentActivity } from '../../services/dashboardService';
import StatCard from '../../components/dashboard/StatCard';
import TicketStatsCard from '../../components/dashboard/TicketStatsCard';
import RecentAnnouncementsWidget from '../../components/dashboard/RecentAnnouncementsWidget';
import ExternalServiceStatusWidget from '../../components/dashboard/ExternalServiceStatusWidget';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useAuth } from '../../hooks/useAuth';

const DashboardPage = () => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Determine if user has access to full statistics
   * Requirement 6.8, 6.9: Role-based content access
   */
  const hasFullAccess = role === 'Tehničar' || role === 'Administrator';
  const canViewTickets = role !== 'Posjetitelj';
  const isPosjetitelj = role === 'Posjetitelj';

  /**
   * Fetch dashboard statistics and recent activity from API
   * Requirement 6.1: Display statistics appropriate to user role
   * Requirement 6.3: Display recent announcements
   */
  const fetchStats = useCallback(async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      // Fetch both stats and recent activity in parallel
      const [statsData, activityData] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(5) // Fetch 5 recent announcements
      ]);
      
      setStats(statsData);
      setRecentActivity(activityData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error?.message || 'Greška prilikom učitavanja statistike');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /**
   * Auto-refresh every 60 seconds
   * Requirement 6.7: Auto-refresh functionality
   */
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchStats(true); // Pass true to indicate auto-refresh
    }, 60000); // 60 seconds

    return () => clearInterval(refreshInterval);
  }, [fetchStats]);

  /**
   * Manual refresh handler
   */
  const handleManualRefresh = () => {
    fetchStats();
  };

  /**
   * Format last refresh time in Croatian
   */
  const formatLastRefresh = () => {
    if (!lastRefresh) return '';
    
    const now = new Date();
    const diffSeconds = Math.floor((now - lastRefresh) / 1000);
    
    if (diffSeconds < 60) {
      return 'Osvježeno prije manje od minute';
    }
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes === 1) {
      return 'Osvježeno prije 1 minute';
    }
    
    return `Osvježeno prije ${diffMinutes} minuta`;
  };

  // Loading state - show skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-neutral-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 w-64 bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="border border-gray-700 bg-gray-800 rounded-lg p-6">
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse mb-4" />
                <div className="h-8 w-16 bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Ticket Details Skeleton */}
          <LoadingSkeleton variant="card" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-900 text-neutral-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-400" size={24} />
              <h2 className="text-xl font-semibold text-red-400">Greška</h2>
            </div>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Pokušaj ponovno
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="text-primary-400" size={32} />
              <div>
                <h1 className="text-4xl font-bold text-white">Nadzorna ploča</h1>
                <p className="text-gray-400 mt-1">
                  Pregled IT operacija i statistike
                </p>
              </div>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              title="Osvježi statistiku"
            >
              <RefreshCw 
                size={18} 
                className={isRefreshing ? 'animate-spin' : ''} 
              />
              <span className="hidden sm:inline">Osvježi</span>
            </button>
          </div>
          
          {lastRefresh && (
            <p className="text-sm text-gray-500">
              {formatLastRefresh()}
            </p>
          )}
        </div>

        {/* Welcome Message */}
        {user && (
          <div className="mb-8 p-4 bg-primary-900/20 border border-primary-500/30 rounded-lg">
            <p className="text-gray-300">
              Dobrodošli, <span className="font-semibold text-white">{user.firstName} {user.lastName}</span>
              {' '}({user.role})
            </p>
            {isPosjetitelj && (
              <p className="text-sm text-gray-400 mt-2">
                Prikazani su samo javni podaci. Prijavite se za pristup većem broju podataka.
              </p>
            )}
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Announcements Card - All roles can see published announcements */}
          {stats?.announcements && (
            <StatCard
              title="Objave"
              value={stats.announcements.published}
              description={
                hasFullAccess && stats.announcements.total !== stats.announcements.published
                  ? `Ukupno: ${stats.announcements.total}`
                  : undefined
              }
              icon={Megaphone}
              variant="info"
            />
          )}

          {/* Assets Card - Only for Tehničar and Administrator */}
          {hasFullAccess && stats?.assets && (
            <StatCard
              title="IT Resursi"
              value={stats.assets.total}
              description={`Aktivno: ${stats.assets.byStatus?.Active || 0}`}
              icon={HardDrive}
              variant="success"
            />
          )}
        </div>

        {/* Detailed Ticket Statistics - Hidden for Posjetitelj */}
        {canViewTickets && stats?.tickets && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Pregled tiketa</h2>
            <TicketStatsCard ticketStats={stats.tickets} />
          </div>
        )}

        {/* External Service Status - Only for Tehničar and Administrator */}
        {hasFullAccess && stats?.externalServices && stats.externalServices.length > 0 && (
          <div className="mb-8">
            <ExternalServiceStatusWidget services={stats.externalServices} />
          </div>
        )}

        {/* Recent Announcements Widget - All roles can see published announcements */}
        {recentActivity?.recentAnnouncements && recentActivity.recentAnnouncements.length > 0 && (
          <div className="mb-8">
            <RecentAnnouncementsWidget 
              announcements={recentActivity.recentAnnouncements}
              loading={loading}
            />
          </div>
        )}

        {/* No Data Message for Posjetitelj or when no stats available */}
        {isPosjetitelj && (!stats?.announcements || stats.announcements.published === 0) && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <Megaphone className="mx-auto mb-4 text-gray-500" size={48} />
            <p className="text-gray-400 text-lg mb-2">
              Trenutno nema objavljenih obavijesti.
            </p>
            <p className="text-gray-500 text-sm">
              Prijavite se za pristup većem broju podataka.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
