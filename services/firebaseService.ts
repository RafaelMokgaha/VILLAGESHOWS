import { User, Video, Comment } from '../types';
import { MOCK_VIDEOS, MOCK_USER, MOCK_COMMENTS } from './mockData';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  increment, 
  setDoc,
  getDoc,
  where,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQ1YsAfJGTLDci-9MJMPtcWiVtbdKJH00",
  authDomain: "villageshows-f9a24.firebaseapp.com",
  projectId: "villageshows-f9a24",
  storageBucket: "villageshows-f9a24.firebasestorage.app",
  messagingSenderId: "152940866764",
  appId: "1:152940866764:web:5fa5cffa8da1206f0be669"
};

// Initialize Firebase with Error Handling
let app;
let auth: any;
let db: any;
let storage: any;

try {
  app = initializeApp(firebaseConfig);
  // We initialize these immediately to ensure registration works.
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log(`✅ Firebase initialized successfully. Connected to: ${firebaseConfig.projectId}`);
} catch (error) {
  console.error("❌ Firebase initialization failed. The app will run in fallback mode where possible.", error);
}

class AppService {
  private currentUser: User | null = null;

  constructor() {
    // Listen to auth state if auth is initialized
    if (auth) {
      onAuthStateChanged(auth, (user: any) => {
        if (user) {
          // Map Firebase user to App User
          this.currentUser = {
            uid: user.uid,
            username: user.displayName || 'Anonymous',
            email: user.email || '',
            profileImage: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=FF7A00&color=fff`,
            followersCount: 0, 
            followingCount: 0,
            createdAt: Date.parse(user.metadata.creationTime || new Date().toISOString())
          };
        } else {
          this.currentUser = null;
        }
      });
    } else {
        console.warn("Auth service not available (mock mode)");
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async login(email: string, password: string): Promise<User> {
    if (!auth) {
        console.warn("Auth not initialized, using mock login");
        this.currentUser = MOCK_USER;
        return MOCK_USER;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch additional user details from Firestore if available
      let userData: any = {};
      if (db) {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                userData = userDoc.data();
            }
        } catch (e) {
            console.warn("Could not fetch user profile from DB", e);
        }
      }

      this.currentUser = {
        uid: user.uid,
        username: user.displayName || userData.username || 'Anonymous',
        email: user.email || '',
        profileImage: user.photoURL || userData.profileImage,
        followersCount: userData.followersCount || 0,
        followingCount: userData.followingCount || 0,
        createdAt: userData.createdAt || Date.now()
      };
      
      return this.currentUser!;
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // FALLBACK: If API Key is invalid or network fails, use Mock User to allow preview
      if (error.code === 'auth/api-key-not-valid' || 
          error.code === 'auth/operation-not-allowed' || 
          error.code === 'auth/network-request-failed' ||
          error.message?.includes('api-key')) {
          console.warn("⚠️ Firebase Auth failed (Invalid Key). Falling back to DEMO USER.");
          this.currentUser = MOCK_USER;
          return MOCK_USER;
      }

      throw error;
    }
  }

  async signup(email: string, password: string, username: string): Promise<User> {
    if (!auth) {
        console.warn("Auth not initialized, using mock signup");
        this.currentUser = MOCK_USER;
        return MOCK_USER;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update Auth Profile
      await updateProfile(user, {
        displayName: username,
        photoURL: `https://ui-avatars.com/api/?name=${username}&background=FF7A00&color=fff`
      });

      // Create User Document in Firestore
      const newUser: User = {
        uid: user.uid,
        username: username,
        email: email,
        profileImage: user.photoURL || '',
        followersCount: 0,
        followingCount: 0,
        createdAt: Date.now()
      };

      if (db) {
        await setDoc(doc(db, "users", user.uid), newUser);
      }
      
      this.currentUser = newUser;
      return newUser;
    } catch (error: any) {
      console.error("Signup failed:", error);

      // FALLBACK: If API Key is invalid, use Mock User
      if (error.code === 'auth/api-key-not-valid' || error.message?.includes('api-key')) {
        console.warn("⚠️ Firebase Auth failed (Invalid Key). Falling back to DEMO USER.");
        this.currentUser = MOCK_USER;
        return MOCK_USER;
      }

      throw error;
    }
  }

  async logout(): Promise<void> {
    if (auth) {
        try {
            await signOut(auth);
        } catch (e) {
            console.warn("Logout error (likely fallback mode)", e);
        }
    }
    this.currentUser = null;
  }

  async getVideos(): Promise<Video[]> {
    if (!db) {
        console.warn("Firestore not available, using mocks");
        return MOCK_VIDEOS;
    }
    try {
      const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const videos: Video[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now());
        
        videos.push({
            ...data,
            id: doc.id,
            createdAt: createdAt
        } as Video);
      });

      if (videos.length === 0) return MOCK_VIDEOS;
      return videos;
    } catch (error) {
      console.warn("Failed to fetch videos from Firestore, falling back to mocks.", error);
      return MOCK_VIDEOS;
    }
  }

  // Real-time subscription to videos
  subscribeToVideos(callback: (videos: Video[]) => void): () => void {
    if (!db) {
        console.warn("Firestore not available, using mocks for subscription");
        callback(MOCK_VIDEOS);
        return () => {};
    }

    try {
      const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const videos: Video[] = [];
        snapshot.forEach((doc) => {
           const data = doc.data();
           const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now());
           videos.push({
               ...data,
               id: doc.id,
               createdAt: createdAt
           } as Video);
        });
        
        if (videos.length === 0) {
            callback(MOCK_VIDEOS); // Fallback if empty so app isn't blank
        } else {
            callback(videos);
        }
      }, (error) => {
        console.error("Error in video subscription (likely invalid key/permissions):", error);
        callback(MOCK_VIDEOS); // Fallback on error
      });
      
      return unsubscribe;
    } catch (e) {
      console.error("Failed to setup subscription", e);
      callback(MOCK_VIDEOS);
      return () => {};
    }
  }

  async uploadVideo(file: File, title: string, description: string): Promise<Video> {
    if (!this.currentUser) throw new Error("Must be logged in");
    
    // Simulate upload if services are missing or broken
    if (!storage || !db) {
        console.warn("Firebase Storage/DB not available, simulating upload.");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            id: `temp_${Date.now()}`,
            ownerId: this.currentUser.uid,
            ownerUsername: this.currentUser.username,
            ownerProfileImage: this.currentUser.profileImage,
            videoUrl: URL.createObjectURL(file),
            thumbnailUrl: 'https://picsum.photos/600/400?random=' + Math.floor(Math.random() * 100),
            title,
            description,
            likesCount: 0,
            commentsCount: 0,
            votesCount: 0,
            createdAt: Date.now(),
            hasLiked: false,
            hasVoted: false
        } as Video;
    }

    try {
      // 1. Upload file to Firebase Storage
      const storageRef = ref(storage, `videos/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Add Video Document to Firestore
      const videoData = {
        ownerId: this.currentUser.uid,
        ownerUsername: this.currentUser.username,
        ownerProfileImage: this.currentUser.profileImage,
        videoUrl: downloadURL,
        thumbnailUrl: 'https://picsum.photos/600/400?random=' + Math.floor(Math.random() * 100),
        title,
        description,
        likesCount: 0,
        commentsCount: 0,
        votesCount: 0,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "videos"), videoData);
      
      return {
        ...videoData,
        id: docRef.id,
        createdAt: Date.now(),
        hasLiked: false,
        hasVoted: false
      } as Video;

    } catch (error: any) {
      console.error("Upload failed:", error);
      // Fallback simulation if key fails during upload
      if (error.code === 'auth/api-key-not-valid' || error.message?.includes('api-key')) {
         alert("Upload failed due to Invalid API Key. Simulating success for demo.");
         return {
            id: `temp_${Date.now()}`,
            ownerId: this.currentUser.uid,
            ownerUsername: this.currentUser.username,
            ownerProfileImage: this.currentUser.profileImage,
            videoUrl: URL.createObjectURL(file),
            thumbnailUrl: 'https://picsum.photos/600/400?random=' + Math.floor(Math.random() * 100),
            title,
            description,
            likesCount: 0,
            commentsCount: 0,
            votesCount: 0,
            createdAt: Date.now(),
            hasLiked: false,
            hasVoted: false
        } as Video;
      }
      throw error;
    }
  }

  async toggleLike(videoId: string): Promise<boolean> {
    if (!this.currentUser) return false;
    if (!db) return true;

    try {
        const videoRef = doc(db, "videos", videoId);
        await updateDoc(videoRef, {
            likesCount: increment(1)
        });
        return true;
    } catch (e) {
        console.warn("Like failed (ignoring for demo)", e);
        return true; 
    }
  }

  async voteForCreator(videoId: string): Promise<boolean> {
    if (!this.currentUser) return false;
    if (!db) return true;

    try {
        const videoRef = doc(db, "videos", videoId);
        await updateDoc(videoRef, {
            votesCount: increment(1)
        });
        return true;
    } catch (e) {
        console.warn("Vote failed (ignoring for demo)", e);
        return true;
    }
  }

  async getComments(videoId: string): Promise<Comment[]> {
    return MOCK_COMMENTS.filter(c => c.videoId === videoId || c.videoId === 'v1');
  }

  async addComment(videoId: string, text: string): Promise<Comment> {
    if (!this.currentUser) throw new Error("Not logged in");
    
    return {
      id: `c_${Date.now()}`,
      videoId,
      userId: this.currentUser.uid,
      username: this.currentUser.username,
      userProfileImage: this.currentUser.profileImage,
      text,
      timestamp: Date.now()
    };
  }

  async searchVideos(queryText: string): Promise<Video[]> {
    const videos = await this.getVideos();
    const lowerQ = queryText.toLowerCase();
    return videos.filter(v => 
      v.title.toLowerCase().includes(lowerQ) || 
      v.ownerUsername.toLowerCase().includes(lowerQ)
    );
  }
}

export const appService = new AppService();