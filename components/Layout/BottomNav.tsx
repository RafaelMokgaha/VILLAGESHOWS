import React from 'react';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import { Tab } from '../../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { tab: Tab.HOME, icon: Home, label: 'Home' },
    { tab: Tab.SEARCH, icon: Search, label: 'Search' },
    { tab: Tab.UPLOAD, icon: PlusSquare, label: 'Upload' },
    { tab: Tab.ACTIVITY, icon: Heart, label: 'Activity' },
    { tab: Tab.PROFILE, icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
      <div className="glass-panel mx-auto max-w-md h-16 rounded-full flex items-center justify-around px-2 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          const Icon = item.icon;
          
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`relative p-3 rounded-full transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/20 blur-md rounded-full" />
              )}
              <Icon 
                size={24} 
                className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,122,0,0.8)]' : ''}`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};