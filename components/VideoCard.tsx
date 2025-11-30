import React, { useRef, useEffect } from 'react';
import { Video } from '../types';
import { Heart, MessageCircle, Share2, Award } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

interface VideoCardProps {
  video: Video;
  isPlaying: boolean;
  onTogglePlay: (id: string) => void;
  onLike: (id: string) => void;
  onVote: (id: string) => void;
  onComment: (id: string) => void;
  onInView: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  isPlaying, 
  onTogglePlay, 
  onLike, 
  onVote, 
  onComment,
  onInView 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play / Visibility Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onInView(video.id);
          }
        });
      },
      { threshold: 0.6 } // Trigger when 60% of the video is visible
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [video.id, onInView]);

  // Handle Play/Pause based on prop
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Playback interrupted or failed (likely browser policy):", error);
          });
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <GlassCard className="mb-6 p-0 overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between p-3 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <img 
            src={video.ownerProfileImage || 'https://picsum.photos/50'} 
            alt={video.ownerUsername} 
            className="w-8 h-8 rounded-full border border-primary shadow-[0_0_10px_rgba(255,122,0,0.5)]"
          />
          <span className="text-white font-medium text-sm drop-shadow-md">@{video.ownerUsername}</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Vote Button (Moved to Header) */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onVote(video.id);
            }}
            disabled={video.hasVoted}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold transition-all border backdrop-blur-md ${
              video.hasVoted 
              ? 'bg-green-500/20 border-green-500 text-green-400' 
              : 'bg-primary/20 border-primary text-primary hover:bg-primary hover:text-white shadow-[0_0_10px_rgba(255,122,0,0.3)]'
            }`}
          >
            <Award size={12} />
            {video.hasVoted ? 'Voted' : 'Vote'}
            {video.votesCount > 0 && <span className="opacity-80 ml-0.5">{video.votesCount}</span>}
          </button>

          <button className="text-xs bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-3 py-1.5 rounded-full transition-colors border border-white/20 font-medium">
            Follow
          </button>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative aspect-[9/16] bg-black">
        <video 
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => onTogglePlay(video.id)}
          playsInline
          loop
          muted={false} // Ensure sound is on if user interacted, browser might block otherwise
        />
        
        {/* Play Button Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm border border-primary flex items-center justify-center shadow-[0_0_30px_rgba(255,122,0,0.5)]">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-4 bg-gradient-to-t from-black/60 to-transparent absolute bottom-0 left-0 right-0 pt-16 pointer-events-none">
        <div className="flex flex-col gap-2 mb-4 pointer-events-auto">
          <h3 className="text-lg font-bold text-white leading-tight neon-text">{video.title}</h3>
          <p className="text-sm text-gray-200 line-clamp-2">{video.description}</p>
        </div>

        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-6">
             {/* Like */}
            <button 
              onClick={(e) => {
                 e.stopPropagation();
                 onLike(video.id);
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`p-2 rounded-full transition-all ${video.hasLiked ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white'}`}>
                <Heart size={24} className={video.hasLiked ? 'fill-current drop-shadow-[0_0_5px_rgba(255,122,0,0.8)]' : ''} />
              </div>
              <span className="text-xs font-medium">{video.likesCount}</span>
            </button>

             {/* Comment */}
            <button 
              onClick={(e) => {
                 e.stopPropagation();
                 onComment(video.id);
              }}
              className="flex flex-col items-center gap-1"
            >
              <div className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
                <MessageCircle size={24} />
              </div>
              <span className="text-xs font-medium">{video.commentsCount}</span>
            </button>

            {/* Share */}
            <button className="flex flex-col items-center gap-1">
              <div className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
                <Share2 size={24} />
              </div>
              <span className="text-xs font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};