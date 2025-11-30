import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { BottomNav } from './components/Layout/BottomNav';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Upload } from './pages/Upload';
import { Activity } from './pages/Activity';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { Tab, User } from './types';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [loading, setLoading] = useState(true);

  // Simulate session check
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab(Tab.HOME);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleUploadSuccess = (tab: Tab) => {
      setActiveTab(tab);
  };

  if (loading) {
     // Splash Screen
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black"></div>
         <div className="relative z-10 flex flex-col items-center animate-pulse">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 italic tracking-tighter" style={{ textShadow: '0 0 20px rgba(255,122,0,0.5)'}}>
                VILLAGE
            </h1>
            <h1 className="text-6xl font-black text-primary italic tracking-tighter neon-text">
                SHOW
            </h1>
         </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case Tab.HOME:
        return <Home />;
      case Tab.SEARCH:
        return <Search />;
      case Tab.UPLOAD:
        return <Upload onSuccess={handleUploadSuccess} />;
      case Tab.ACTIVITY:
        return <Activity />;
      case Tab.PROFILE:
        return <Profile user={user} onLogout={handleLogout} />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050505] to-[#0a0a0a] text-white">
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <main>
        {renderContent()}
      </main>
      
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;