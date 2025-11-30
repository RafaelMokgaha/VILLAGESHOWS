import React, { useEffect, useState, useCallback } from 'react';
import { VideoCard } from '../components/VideoCard';
import { Video } from '../types';
import { appService } from '../services/firebaseService';

export const Home: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const data = await appService.getVideos();
      setVideos(data);
      // Optional: Auto-play the first video on load if needed
      // if (data.length > 0) setPlayingVideoId(data[0].id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlay = (id: string) => {
    setPlayingVideoId(prevId => (prevId === id ? null : id));
  };

  // Callback for scroll-based auto-play
  const handleInView = useCallback((id: string) => {
    setPlayingVideoId(currentId => {
      // Only update if it's different to avoid re-renders
      if (currentId !== id) return id;
      return currentId;
    });
  }, []);

  const handleLike = async (id: string) => {
    await appService.toggleLike(id);
    setVideos(prev => prev.map(v => {
      if (v.id === id) {
        const newLiked = !v.hasLiked;
        return { 
          ...v, 
          hasLiked: newLiked,
          likesCount: v.likesCount + (newLiked ? 1 : -1)
        };
      }
      return v;
    }));
  };

  const handleVote = async (id: string) => {
    const success = await appService.voteForCreator(id);
    if (success) {
      setVideos(prev => prev.map(v => v.id === id ? { ...v, hasVoted: true, votesCount: v.votesCount + 1 } : v));
    }
  };

  const handleComment = (id: string) => {
    // Navigate to comment view (placeholder for logic)
    console.log("Open comments for", id);
  };

  return (
    <div className="pb-36 pt-4 px-4 max-w-lg mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold italic tracking-tighter text-white">
          VILLAGE <span className="text-primary neon-text">SHOW</span>
        </h1>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-600 animate-pulse-slow"></div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center mt-20 space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">Loading Feed...</p>
        </div>
      ) : (
        videos.map(video => (
          <VideoCard 
            key={video.id} 
            video={video} 
            isPlaying={playingVideoId === video.id}
            onTogglePlay={handleTogglePlay}
            onInView={handleInView}
            onLike={handleLike} 
            onVote={handleVote}
            onComment={handleComment}
          />
        ))
      )}
    </div>
  );
};