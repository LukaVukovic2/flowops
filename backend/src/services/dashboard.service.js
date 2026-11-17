/**
 * Dashboard Service
 * Business logic for dashboard statistics and activity
 * Requirements: 6.1, 6.2, 6.8, 6.9
 */

import supabase from '../config/database.js';

// Cache configuration
const CACHE_TTL = 30000; // 30 seconds in milliseconds
const cache = {
  data: null,
  timestamp: null,
  userRole: null,
  userId: null
};

/**
 * Check if cache is valid for the given user and role
 */
function isCacheValid(userId, role) {
  if (!cache.data || !cache.timestamp) {
    return false;
  }

  const now = Date.now();
  const isExpired = (now - cache.timestamp) > CACHE_TTL;
  
  // Cache is only valid for the same user/role combination
  const isSameUser = cache.userId === userId && cache.userRole === role;
  
  return !isExpired && isSameUser;
}

/**
 * Update cache with new data
 */
function updateCache(userId, role, data) {
  cache.data = data;
  cache.timestamp = Date.now();
  cache.userId = userId;
  cache.userRole = role;
}

/**
 * Get ticket statistics by status
 * @param {string} userId - User ID for filtering
 * @param {string} role - User role for filtering
 * @returns {Promise<Object>} Ticket counts by status
 */
async function getTicketStats(userId, role) {
  let query = supabase
    .from('tickets')
    .select('status', { count: 'exact', head: false });

  // Apply role-based filtering
  // Requirement 6.8: Posjetitelj sees nothing
  // Requirement 6.9: Registrirani_Korisnik sees own tickets only
  if (role === 'Posjetitelj') {
    // Posjetitelj should not see any tickets
    return {
      total: 0,
      byStatus: {
        'Nova': 0,
        'U radu': 0,
        'Na čekanju': 0,
        'Riješena': 0,
        'Zatvorena': 0
      }
    };
  } else if (role === 'Registrirani_Korisnik') {
    // Only own tickets
    query = query.eq('creator_id', userId);
  } else if (role === 'Tehničar') {
    // Assigned tickets only
    query = query.eq('assignee_id', userId);
  }
  // Administrator sees all tickets (no filter)

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching ticket stats:', error);
    throw new Error('Failed to fetch ticket statistics');
  }

  // Count tickets by status
  const byStatus = {
    'Nova': 0,
    'U radu': 0,
    'Na čekanju': 0,
    'Riješena': 0,
    'Zatvorena': 0
  };

  data.forEach(ticket => {
    if (byStatus[ticket.status] !== undefined) {
      byStatus[ticket.status]++;
    }
  });

  const total = data.length;

  return { total, byStatus };
}

/**
 * Get announcement statistics
 * @param {string} role - User role for filtering
 * @returns {Promise<Object>} Announcement counts
 */
async function getAnnouncementStats(role) {
  // Requirement 6.8, 6.9: All roles can see published announcements
  // Tehničar and Administrator can see unpublished counts as well
  
  let totalQuery = supabase
    .from('announcements')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  let publishedQuery = supabase
    .from('announcements')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)
    .is('deleted_at', null);

  const [totalResult, publishedResult] = await Promise.all([
    totalQuery,
    publishedQuery
  ]);

  if (totalResult.error || publishedResult.error) {
    console.error('Error fetching announcement stats:', totalResult.error || publishedResult.error);
    throw new Error('Failed to fetch announcement statistics');
  }

  // Posjetitelj and Registrirani_Korisnik should only see published count
  if (role === 'Posjetitelj' || role === 'Registrirani_Korisnik') {
    return {
      total: publishedResult.count,
      published: publishedResult.count
    };
  }

  // Tehničar and Administrator see both
  return {
    total: totalResult.count,
    published: publishedResult.count
  };
}

/**
 * Get asset statistics by status
 * @param {string} role - User role for filtering
 * @returns {Promise<Object>} Asset counts by status
 */
async function getAssetStats(role) {
  // Requirements 6.8, 6.9: Only Tehničar and Administrator see assets
  if (role === 'Posjetitelj' || role === 'Registrirani_Korisnik') {
    return null; // Don't include assets for these roles
  }

  // Check if assets table exists, return null if not (assets not implemented yet)
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('status', { count: 'exact', head: false });

    if (error) {
      // If table doesn't exist or other error, return null
      console.warn('Assets table not accessible:', error.message);
      return null;
    }

    // Count assets by status
    const byStatus = {
      'Active': 0,
      'Inactive': 0,
      'Maintenance': 0,
      'Retired': 0
    };

    data.forEach(asset => {
      if (byStatus[asset.status] !== undefined) {
        byStatus[asset.status]++;
      }
    });

    const total = data.length;

    return { total, byStatus };
  } catch (error) {
    console.warn('Error fetching asset stats:', error);
    return null;
  }
}

/**
 * Get external service status
 * @returns {Promise<Array>} External service statuses
 */
async function getExternalServiceStatus() {
  try {
    const { data, error } = await supabase
      .from('external_service_status')
      .select('*')
      .gte('cached_until', new Date().toISOString()); // Only get non-expired cache

    if (error) {
      console.warn('Error fetching external service status:', error);
      return [];
    }

    return data.map(service => ({
      name: service.service_name,
      status: service.status,
      lastChecked: service.last_checked_at
    }));
  } catch (error) {
    console.warn('Error fetching external service status:', error);
    return [];
  }
}

/**
 * Get dashboard statistics
 * Requirement 6.1: Display statistics appropriate to user role
 * Requirement 6.2: Display real-time ticket counts by status
 * Requirement 6.8: Different content based on role
 * Requirement 6.9: Posjetitelj sees only public information
 * 
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<Object>} Dashboard statistics
 */
export async function getDashboardStatistics(userId, role) {
  // Check cache first
  if (isCacheValid(userId, role)) {
    return cache.data;
  }

  // Fetch fresh statistics
  const [ticketStats, announcementStats, assetStats, externalServices] = await Promise.all([
    getTicketStats(userId, role),
    getAnnouncementStats(role),
    getAssetStats(role),
    getExternalServiceStatus()
  ]);

  const stats = {
    tickets: ticketStats,
    announcements: announcementStats
  };

  // Only include assets for Tehničar and Administrator
  if (assetStats !== null) {
    stats.assets = assetStats;
  }

  // Include external services (all roles can see this)
  if (externalServices.length > 0) {
    stats.externalServices = externalServices;
  }

  // Update cache
  updateCache(userId, role, stats);

  return stats;
}

/**
 * Get recent activity (tickets and announcements)
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @param {number} limit - Number of items to return
 * @returns {Promise<Object>} Recent activity
 */
export async function getRecentActivity(userId, role, limit = 10) {
  // Get recent tickets based on role
  let ticketQuery = supabase
    .from('tickets')
    .select(`
      id,
      title,
      status,
      created_at,
      updated_at,
      creator:users!tickets_creator_id_fkey(first_name, last_name)
    `)
    .order('updated_at', { ascending: false })
    .limit(limit);

  // Apply role-based filtering
  if (role === 'Posjetitelj') {
    // No tickets for Posjetitelj
    ticketQuery = ticketQuery.eq('id', '00000000-0000-0000-0000-000000000000'); // Impossible match
  } else if (role === 'Registrirani_Korisnik') {
    ticketQuery = ticketQuery.eq('creator_id', userId);
  } else if (role === 'Tehničar') {
    ticketQuery = ticketQuery.eq('assignee_id', userId);
  }

  // Get recent published announcements (all roles)
  const announcementQuery = supabase
    .from('announcements')
    .select(`
      id,
      title,
      published_at,
      author:users!announcements_author_id_fkey(first_name, last_name)
    `)
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
    .limit(limit);

  const [ticketsResult, announcementsResult] = await Promise.all([
    ticketQuery,
    announcementQuery
  ]);

  if (ticketsResult.error) {
    console.error('Error fetching recent tickets:', ticketsResult.error);
  }

  if (announcementsResult.error) {
    console.error('Error fetching recent announcements:', announcementsResult.error);
  }

  return {
    recentTickets: ticketsResult.data || [],
    recentAnnouncements: announcementsResult.data || []
  };
}
