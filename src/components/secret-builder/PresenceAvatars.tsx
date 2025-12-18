import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserData {
  id: string;
  name: string;
  color: string;
  activeSection: string | null;
}

interface PresenceAvatarsProps {
  users: UserData[];
  maxVisible?: number;
}

export const PresenceAvatars: React.FC<PresenceAvatarsProps> = ({ 
  users, 
  maxVisible = 5 
}) => {
  if (users.length === 0) return null;

  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        <AnimatePresence mode="popLayout">
          {visibleUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.5, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: -10 }}
              transition={{ delay: index * 0.05 }}
              style={{ zIndex: visibleUsers.length - index }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-background cursor-default"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-medium">{user.name}</p>
                  {user.activeSection && (
                    <p className="text-muted-foreground">
                      Editing: {user.activeSection}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
        </AnimatePresence>

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-muted text-muted-foreground border-2 border-background">
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{remainingCount} more user{remainingCount > 1 ? 's' : ''}</p>
            </TooltipContent>
          </Tooltip>
        )}

        <div className="ml-3 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-muted-foreground">
            {users.length + 1} online
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
};
