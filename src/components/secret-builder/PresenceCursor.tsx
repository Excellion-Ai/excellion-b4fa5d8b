import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CursorData {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
}

interface PresenceCursorProps {
  cursors: CursorData[];
  containerRef: React.RefObject<HTMLElement>;
}

export const PresenceCursor: React.FC<PresenceCursorProps> = ({ cursors, containerRef }) => {
  return (
    <AnimatePresence>
      {cursors.map((user) => {
        if (!user.cursor) return null;

        return (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed z-[9999]"
            style={{
              left: user.cursor.x,
              top: user.cursor.y,
              transform: 'translate(-2px, -2px)'
            }}
          >
            {/* Cursor arrow */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
            >
              <path
                d="M5.5 3.5L18 12L12 13L9.5 20.5L5.5 3.5Z"
                fill={user.color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            
            {/* Name tag */}
            <div
              className="absolute left-5 top-4 px-2 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap"
              style={{ 
                backgroundColor: user.color,
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            >
              {user.name}
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
};
