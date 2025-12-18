import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UserPresence {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
  activeSection: string | null;
  lastActive: number;
}

interface PresenceState {
  users: UserPresence[];
  currentUserId: string;
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

const generateUserId = () => `user_${Math.random().toString(36).substr(2, 9)}`;
const generateUserName = () => `User ${Math.floor(Math.random() * 1000)}`;
const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export const usePresence = (projectId: string | null) => {
  const [presenceState, setPresenceState] = useState<PresenceState>({
    users: [],
    currentUserId: ''
  });
  const channelRef = useRef<RealtimeChannel | null>(null);
  const userDataRef = useRef({
    id: generateUserId(),
    name: generateUserName(),
    color: getRandomColor()
  });

  useEffect(() => {
    if (!projectId) return;

    const userData = userDataRef.current;
    setPresenceState(prev => ({ ...prev, currentUserId: userData.id }));

    const channel = supabase.channel(`presence:${projectId}`, {
      config: { presence: { key: userData.id } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: UserPresence[] = [];
        
        Object.entries(state).forEach(([key, presences]) => {
          if (presences && presences.length > 0) {
            const presence = presences[0] as any;
            users.push({
              id: key,
              name: presence.name || 'Anonymous',
              color: presence.color || '#888',
              cursor: presence.cursor || null,
              activeSection: presence.activeSection || null,
              lastActive: presence.lastActive || Date.now()
            });
          }
        });

        setPresenceState(prev => ({ ...prev, users }));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: userData.id,
            name: userData.name,
            color: userData.color,
            cursor: null,
            activeSection: null,
            lastActive: Date.now()
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [projectId]);

  const updateCursor = useCallback((cursor: { x: number; y: number } | null) => {
    const channel = channelRef.current;
    const userData = userDataRef.current;
    
    if (channel) {
      channel.track({
        id: userData.id,
        name: userData.name,
        color: userData.color,
        cursor,
        activeSection: null,
        lastActive: Date.now()
      });
    }
  }, []);

  const updateActiveSection = useCallback((sectionId: string | null) => {
    const channel = channelRef.current;
    const userData = userDataRef.current;
    
    if (channel) {
      channel.track({
        id: userData.id,
        name: userData.name,
        color: userData.color,
        cursor: null,
        activeSection: sectionId,
        lastActive: Date.now()
      });
    }
  }, []);

  const otherUsers = presenceState.users.filter(
    u => u.id !== presenceState.currentUserId
  );

  return {
    users: presenceState.users,
    otherUsers,
    currentUserId: presenceState.currentUserId,
    updateCursor,
    updateActiveSection
  };
};
