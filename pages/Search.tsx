import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Video } from '../types';
import { appService } from '../services/appService';
import { MOCK_VIDEOS } from '../services/mockData';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Video[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const data = await appService.searchVideos(query);
    setResults(data);
  };

  return (
    <div className="pb-36 pt-4 px-4 max-w-lg mx-auto min-h-screen">
      <form onSubmit={handleSearch} className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search creators, videos, tags..."
          className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-gray-500"
        />
        <SearchIcon className="absolute left-4 top-3.5 text-gray-400" size={20} />
      </form>

      <div className="mb-6">
        <h3 className="text-white font-bold mb-3">Trending Now</h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {['#NeonVibes', '#Cyberpunk', '#NightLife', '#Music', '#Art'].map(tag => (
                <span key={tag} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm whitespace-nowrap text-gray-300 hover:border-primary hover:text-primary transition-colors cursor-pointer">
                    {tag}
                </span>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(results.length > 0 ? results : MOCK_VIDEOS).map((video) => (
          <div key={video.id} className="relative rounded-xl overflow-hidden aspect-[9/16] group">
            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100">
                <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-bold truncate">{video.title}</p>
                    <p className="text-gray-300 text-[10px]">@{video.ownerUsername}</p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};