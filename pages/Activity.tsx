import React, { useState } from 'react';
import { MOCK_NOTIFICATIONS } from '../services/mockData';
import { GlassCard } from '../components/ui/GlassCard';
import { Heart, UserPlus, MessageCircle, Award } from 'lucide-react';

export const Activity: React.FC = () => {
  return (
    <div className="pb-36 pt-4 px-4 max-w-lg mx-auto min-h-screen">
      <h2 className="text-2xl font-bold text-white mb-6">Activity</h2>
      
      <div className="space-y-2">
        {MOCK_NOTIFICATIONS.map(notif => {
            let Icon = Heart;
            let iconColor = "text-pink-500";
            if (notif.type === 'follow') { Icon = UserPlus; iconColor = "text-blue-500"; }
            if (notif.type === 'comment') { Icon = MessageCircle; iconColor = "text-green-500"; }
            if (notif.type === 'vote') { Icon = Award; iconColor = "text-primary"; }

            return (
                <GlassCard key={notif.id} className="flex items-center gap-3 !p-3 hover:bg-white/5 transition-colors">
                    <div className="relative">
                        <img src={notif.senderImage} alt={notif.senderName} className="w-10 h-10 rounded-full border border-white/10" />
                        <div className={`absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1 ${iconColor}`}>
                            <Icon size={10} fill="currentColor" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-200">
                            <span className="font-bold text-white">{notif.senderName}</span> {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">2h ago</p>
                    </div>
                    {notif.type !== 'follow' && (
                        <div className="w-10 h-10 rounded bg-gray-700 overflow-hidden">
                             {/* Placeholder for video thumbnail if available */}
                             <div className="w-full h-full bg-primary/20"></div>
                        </div>
                    )}
                </GlassCard>
            )
        })}
      </div>
    </div>
  );
};