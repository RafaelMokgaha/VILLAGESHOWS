import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div className={`glass-panel rounded-2xl p-4 transition-all duration-300 ${glow ? 'shadow-[0_0_15px_rgba(255,122,0,0.15)] border-primary/30' : ''} ${className}`}>
      {children}
    </div>
  );
};