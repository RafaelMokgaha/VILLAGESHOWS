import React from 'react';
import { User, Video } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Settings, Grid, Heart, Play } from 'lucide-react';
import { MOCK_VIDEOS } from '../services/mockData';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  // Filter mock videos for this user for demo
  const userVideos = MOCK_VIDEOS.filter(v => v.ownerId === user.uid || v.ownerId === 'u2' || v.ownerId === 'u3'); 

  return (
    <div className="pb-36 pt-4 px-4 max-w-lg mx-auto min-h-screen">
       {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">{user.username}</h2>
        <Button variant="ghost" className="!p-2" onClick={onLogout}>
          <Settings size={24} />
        </Button>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
            <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-40"></div>
            <img 
            src={user.profileImage} 
            alt="Profile" 
            className="w-24 h-24 rounded-full border-2 border-primary relative z-10 object-cover"
            />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-1">{user.username}</h1>
        <p className="text-gray-400 text-center text-sm mb-4 max-w-xs">{user.bio || 'No bio yet.'}</p>

        <div className="flex items-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{user.followingCount}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Following</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{user.followersCount}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">12.5k</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Likes</div>
          </div>
        </div>

        <div className="flex gap-2 w-full max-w-xs">
          <Button fullWidth variant="primary" className="!py-2 !text-sm">Edit Profile</Button>
          <Button fullWidth variant="glass" className="!py-2 !text-sm">Share</Button>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex border-b border-white/10 mb-4">
        <button className="flex-1 pb-3 border-b-2 border-primary text-primary flex justify-center">
          <Grid size={20} />
        </button>
        <button className="flex-1 pb-3 border-b-2 border-transparent text-gray-500 flex justify-center">
          <Heart size={20} />
        </button>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-3 gap-1">
        {userVideos.map(video => (
          <div key={video.id} className="aspect-[3/4] relative bg-gray-800 cursor-pointer group overflow-hidden">
            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-[10px] font-bold drop-shadow-md">
              <Play size={10} fill="white" />
              {video.likesCount}
            </div>
          </div>
        ))}
         {/* Placeholders to fill grid */}
         {[1,2,3,4].map(n => (
            <div key={n} className="aspect-[3/4] bg-white/5 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/10"></div>
            </div>
         ))}
      </div>
    </div>
  );
};