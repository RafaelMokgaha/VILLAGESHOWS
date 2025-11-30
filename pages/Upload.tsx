import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Upload as UploadIcon, X, Film, AlertCircle } from 'lucide-react';
import { appService } from '../services/firebaseService';
import { Tab } from '../types';

interface UploadProps {
  onSuccess: (tab: Tab) => void;
}

export const Upload: React.FC<UploadProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file || !title) return;
    
    setUploading(true);
    try {
      await appService.uploadVideo(file, title, description);
      // Reset form
      setFile(null);
      setPreview(null);
      setTitle('');
      setDescription('');
      onSuccess(Tab.HOME);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-36 pt-8 min-h-screen">
      <h2 className="text-3xl font-bold text-white mb-6 neon-text text-center">Upload Video</h2>

      {!file ? (
        <GlassCard className="h-64 border-dashed border-2 border-primary/40 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-colors relative overflow-hidden group">
          <input 
            type="file" 
            accept="video/*" 
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <div className="p-6 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(255,122,0,0.2)]">
            <UploadIcon size={40} />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-white">Select Video</p>
            <p className="text-sm text-gray-400">MP4, MOV up to 60 sec</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_20px_rgba(255,122,0,0.1)]">
            <video src={preview!} className="w-full h-full object-cover" controls />
            <button 
              onClick={removeFile}
              className="absolute top-4 right-4 p-2 bg-red-500/80 rounded-full text-white hover:bg-red-600 backdrop-blur-md"
            >
              <X size={20} />
            </button>
          </div>

          <GlassCard className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-primary mb-1 uppercase tracking-wider">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your video a catchy title..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-primary mb-1 uppercase tracking-wider">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this video about? #tags"
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-gray-500 resize-none"
              />
            </div>
          </GlassCard>

          <Button 
            onClick={handleUpload} 
            disabled={uploading} 
            fullWidth
            variant="primary"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <Film size={20} />
                Publish Show
              </>
            )}
          </Button>

          <div className="flex items-start gap-2 text-gray-400 text-xs px-2">
             <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
             <p>Your video will be publicly visible on the main feed immediately after upload.</p>
          </div>
        </div>
      )}
    </div>
  );
};