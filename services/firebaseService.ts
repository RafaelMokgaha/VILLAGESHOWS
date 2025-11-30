import { User, Video, Comment } from '../types';
import { MOCK_VIDEOS, MOCK_USER, MOCK_COMMENTS } from './mockData';

// NOTE: This is where you would initialize Firebase
// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, addDoc, getDocs, onSnapshot, ... } from "firebase/firestore";
// import { getAuth, signInWithPopup, GoogleAuthProvider, ... } from "firebase/auth";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   // ... other config
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const auth = getAuth(app);
// const storage = getStorage(app);

// Simulating API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AppService {
  private videos: Video[] = [...MOCK_VIDEOS];
  private currentUser: User | null = null;

  async login(email: string, password: string): Promise<User> {
    await delay(1000); // Simulate network
    // Real impl: await signInWithEmailAndPassword(auth, email, password);
    this.currentUser = MOCK_USER;
    return MOCK_USER;
  }

  async signup(email: string, password: string, username: string): Promise<User> {
    await delay(1500);
    // Real impl: createUserWithEmailAndPassword, then setDoc to 'users' collection
    this.currentUser = {
      ...MOCK_USER,
      username,
      email
    };
    return this.currentUser;
  }

  async logout(): Promise<void> {
    await delay(500);
    this.currentUser = null;
  }

  async getVideos(): Promise<Video[]> {
    await delay(800);
    // Real impl: const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    return this.videos.sort((a, b) => b.createdAt - a.createdAt);
  }

  async uploadVideo(file: File, title: string, description: string): Promise<Video> {
    await delay(3000); // Simulate upload
    // Real impl: Upload to Storage -> Get URL -> Add Doc to Firestore
    
    const newVideo: Video = {
      id: `new_v_${Date.now()}`,
      ownerId: this.currentUser?.uid || 'guest',
      ownerUsername: this.currentUser?.username || 'Guest',
      ownerProfileImage: this.currentUser?.profileImage,
      videoUrl: URL.createObjectURL(file), // Local preview url for demo
      thumbnailUrl: 'https://picsum.photos/600/400?random=99',
      title,
      description,
      likesCount: 0,
      commentsCount: 0,
      votesCount: 0,
      createdAt: Date.now(),
      hasLiked: false,
      hasVoted: false
    };
    
    this.videos = [newVideo, ...this.videos];
    return newVideo;
  }

  async toggleLike(videoId: string): Promise<boolean> {
    await delay(200);
    const video = this.videos.find(v => v.id === videoId);
    if (video) {
      video.hasLiked = !video.hasLiked;
      video.likesCount += video.hasLiked ? 1 : -1;
      return video.hasLiked;
    }
    return false;
  }

  async voteForCreator(videoId: string): Promise<boolean> {
    await delay(200);
    const video = this.videos.find(v => v.id === videoId);
    if (video && !video.hasVoted) {
      video.hasVoted = true;
      video.votesCount += 1;
      return true;
    }
    return false;
  }

  async getComments(videoId: string): Promise<Comment[]> {
    await delay(400);
    return MOCK_COMMENTS.filter(c => c.videoId === videoId || c.videoId === 'v1'); // Fallback to mocks
  }

  async addComment(videoId: string, text: string): Promise<Comment> {
    await delay(300);
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      videoId,
      userId: this.currentUser?.uid || 'guest',
      username: this.currentUser?.username || 'Guest',
      userProfileImage: this.currentUser?.profileImage,
      text,
      timestamp: Date.now()
    };
    return newComment;
  }

  async searchVideos(query: string): Promise<Video[]> {
    await delay(400);
    const lowerQ = query.toLowerCase();
    return this.videos.filter(v => 
      v.title.toLowerCase().includes(lowerQ) || 
      v.ownerUsername.toLowerCase().includes(lowerQ)
    );
  }
}

export const appService = new AppService();