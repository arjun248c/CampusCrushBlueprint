import { supabase } from './supabase';
import { storage } from './storage';

// Real-time leaderboard updates
export function setupRealtimeLeaderboard() {
  // Subscribe to rating changes to trigger leaderboard updates
  const ratingsSubscription = supabase
    .channel('ratings-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ratings',
      },
      async (payload) => {
        console.log('New rating received:', payload);
        
        // Get the college ID from the rating
        const rating = payload.new as any;
        if (rating.collegeId) {
          // Recompute leaderboard for this college
          try {
            await storage.computeLeaderboard(rating.collegeId);
            console.log(`Leaderboard updated for college: ${rating.collegeId}`);
          } catch (error) {
            console.error('Error updating leaderboard:', error);
          }
        }
      }
    )
    .subscribe();

  console.log('Real-time leaderboard updates enabled');
  
  return ratingsSubscription;
}

// Real-time user stats updates
export function setupRealtimeUserStats() {
  const userStatsSubscription = supabase
    .channel('user-stats-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: 'ratingsReceived=gt.0',
      },
      (payload) => {
        console.log('User stats updated:', payload);
        // Could broadcast to connected clients here
      }
    )
    .subscribe();

  console.log('Real-time user stats updates enabled');
  
  return userStatsSubscription;
}

// Initialize all real-time subscriptions
export function initializeRealtime() {
  const subscriptions = [
    setupRealtimeLeaderboard(),
    setupRealtimeUserStats(),
  ];

  // Cleanup on process exit
  process.on('SIGINT', () => {
    console.log('Cleaning up real-time subscriptions...');
    subscriptions.forEach(sub => sub.unsubscribe());
  });

  process.on('SIGTERM', () => {
    console.log('Cleaning up real-time subscriptions...');
    subscriptions.forEach(sub => sub.unsubscribe());
  });

  return subscriptions;
}