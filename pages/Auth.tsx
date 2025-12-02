import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { appService } from '../services/appService';
import { User } from '../types';
import { Camera, AlertCircle, Mail, CheckCircle, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [name, setName] = useState(''); // Full Name
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
        const user = await appService.loginWithGoogle();
        onLogin(user);
    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Google Sign In failed.');
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (isLogin) {
            // --- LOGIN ---
            if (!email || !password) throw new Error("Email and password required");
            try {
              const user = await appService.loginWithEmail(email, password);
              onLogin(user);
            } catch (authError: any) {
              // Specific requirement: "Password or Email Incorrect"
              if (authError.code === 'auth/invalid-credential' || 
                  authError.code === 'auth/user-not-found' || 
                  authError.code === 'auth/wrong-password' ||
                  authError.code === 'auth/invalid-email') {
                 throw new Error("Password or Email Incorrect");
              }
              throw authError;
            }
        } else {
            // --- SIGNUP ---
            if (!email || !password || !repeatPassword || !name) throw new Error("Please fill in all fields");
            if (password !== repeatPassword) throw new Error("Passwords do not match");
            
            try {
              const user = await appService.signupWithEmail(email, password, { 
                name, 
                profileImageFile: profileImage || undefined 
              });
              onLogin(user);
            } catch (signupError: any) {
              // Specific requirement: "User already exists. Sign in?"
              if (signupError.code === 'auth/email-already-in-use') {
                throw new Error("User already exists. Sign in?");
              }
              if (signupError.code === 'auth/weak-password') {
                throw new Error("Password should be at least 6 characters.");
              }
              throw signupError;
            }
        }
    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Authentication failed.');
    } finally {
        setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        setError("Please enter your email address.");
        return;
    }
    setError('');
    setLoading(true);
    try {
        await appService.resetPassword(email);
        setResetSent(true);
    } catch (err: any) {
        setError(err.message || 'Failed to send reset email.');
    } finally {
        setLoading(false);
    }
  };

  const reset = () => {
    setError('');
    setEmail('');
    setPassword('');
    setRepeatPassword('');
    setName('');
    setProfileImage(null);
    setProfilePreview(null);
    setIsForgotPassword(false);
    setResetSent(false);
  };

  const switchToLogin = () => {
      setIsLogin(true);
      setError('');
      reset(); // Full reset to clear fields
      setIsForgotPassword(false); // Ensure we aren't in forgot pass mode
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
        
        {isForgotPassword ? (
            /* --- FORGOT PASSWORD FLOW --- */
            resetSent ? (
                /* --- STEP 2: SUCCESS --- */
                <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/40 shadow-[0_0_20px_rgba(255,122,0,0.3)]">
                        <CheckCircle size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Check your mail</h3>
                    <p className="text-gray-400 text-sm mb-6 px-4">
                        We sent you a password change link to <br/>
                        <span className="text-white font-medium">{email}</span>
                    </p>
                    <Button fullWidth onClick={switchToLogin}>
                        Sign In
                    </Button>
                </div>
            ) : (
                /* --- STEP 1: REQUEST LINK --- */
                <form onSubmit={handleResetPassword} className="space-y-6 py-2">
                     <div className="text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
                        <p className="text-gray-400 text-xs">Enter your email to receive instructions.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Email Address</label>
                        <div className="relative">
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-primary transition-all"
                                placeholder="you@example.com"
                                required
                            />
                            <Mail className="absolute left-3 top-3.5 text-gray-500" size={16} />
                        </div>
                    </div>

                    {error && (
                         <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                             <AlertCircle size={16} className="text-red-400" />
                             <p className="text-xs font-medium text-red-400">{error}</p>
                         </div>
                    )}

                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? 'Sending...' : 'Get Reset Link'}
                    </Button>

                    <button 
                        type="button" 
                        onClick={() => setIsForgotPassword(false)}
                        className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-2"
                    >
                        <ArrowLeft size={16} />
                        Back to Log In
                    </button>
                </form>
            )
        ) : (
            /* --- NORMAL LOGIN/SIGNUP FLOW --- */
            <>
                {/* Sign In / Sign Up Toggle */}
                <div className="flex mb-6 border-b border-white/10">
                <button 
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                    onClick={() => { setIsLogin(true); reset(); }}
                >
                    Log In
                </button>
                <button 
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                    onClick={() => { setIsLogin(false); reset(); }}
                >
                    Sign Up
                </button>
                </div>

                <div className="mb-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white text-gray-900 rounded-xl px-4 py-3 flex items-center justify-center gap-3 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <img 
                            src="https://static.wixstatic.com/media/a827d0_feca5ecaabdf4deebb12dbb5b8598d4c~mv2.png" 
                            alt="Google"
                            className="w-5 h-5"
                        />
                        {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-black px-2 text-gray-500">OR</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* --- SIGN UP: Personal Details --- */}
                {!isLogin && (
                    <>
                    <div className="flex flex-col items-center mb-4">
                        <div className="relative w-24 h-24 rounded-full bg-white/5 border border-white/20 flex items-center justify-center overflow-hidden cursor-pointer group hover:border-primary transition-colors">
                            {profilePreview ? (
                            <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                            <div className="flex flex-col items-center text-gray-400 group-hover:text-primary">
                                <Camera size={24} />
                                <span className="text-[10px] mt-1">Upload</span>
                            </div>
                            )}
                            <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleImageChange}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Profile Photo</p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Full Name</label>
                        <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                        placeholder="John Doe"
                        required
                        />
                    </div>
                    </>
                )}

                {/* --- EMAIL & PASSWORD INPUTS --- */}
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                        placeholder="you@example.com"
                        required
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
                        required
                    />
                    {isLogin && (
                        <div className="text-right mt-1.5">
                            <button 
                                type="button" 
                                onClick={() => setIsForgotPassword(true)}
                                className="text-xs text-primary/80 hover:text-primary transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}
                </div>
                
                {!isLogin && (
                    <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Repeat Password</label>
                    <input 
                        type="password" 
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                        placeholder="••••••••"
                        required
                    />
                    </div>
                )}

                {error && (
                    <div className={`p-3 rounded-lg flex flex-col items-center gap-2 ${error === "User already exists. Sign in?" ? 'bg-primary/10 border border-primary/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} className={error === "User already exists. Sign in?" ? 'text-primary' : 'text-red-400'} />
                        <p className={`text-xs font-medium ${error === "User already exists. Sign in?" ? 'text-primary' : 'text-red-400'}`}>{error}</p>
                    </div>
                    
                    {/* Specific link for User Exists error */}
                    {error === "User already exists. Sign in?" && (
                        <button 
                        type="button" 
                        onClick={switchToLogin}
                        className="w-full py-1.5 rounded bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold transition-colors uppercase tracking-wide border border-primary/30"
                        >
                        Go to Sign In
                        </button>
                    )}
                    </div>
                )}
                
                <Button 
                    type="submit" 
                    fullWidth 
                    className="mt-6"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                </Button>
                </form>
            </>
        )}
        
      </GlassCard>
    </div>
  );
};