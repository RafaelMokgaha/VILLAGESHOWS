import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { appService } from '../services/firebaseService';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let user;
      if (isLogin) {
        user = await appService.login(email, password);
      } else {
        if (!username) throw new Error("Username required");
        user = await appService.signup(email, password, username);
      }
      onLogin(user);
    } catch (err) {
      setError('Authentication failed. Use demo login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse-slow delay-1000"></div>

      <div className="text-center mb-8 relative z-10">
        <h1 className="text-5xl font-bold italic tracking-tighter text-white mb-2 neon-text">
          VILLAGE
        </h1>
        <h1 className="text-5xl font-bold italic tracking-tighter text-primary neon-text">
          SHOW
        </h1>
        <p className="text-gray-400 mt-4 text-sm font-light">The future of social entertainment.</p>
      </div>

      <GlassCard className="w-full max-w-sm relative z-10 border-white/10 !bg-black/40">
        <div className="flex mb-6 border-b border-white/10">
          <button 
            className={`flex-1 py-3 text-sm font-medium transition-colors ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
            onClick={() => setIsLogin(true)}
          >
            Log In
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium transition-colors ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                placeholder="@username"
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
              placeholder="hello@villageshow.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <Button 
            type="submit" 
            fullWidth 
            className="mt-6"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Enter Village' : 'Create Account')}
          </Button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <Button type="button" variant="secondary" fullWidth className="text-sm">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Google
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};