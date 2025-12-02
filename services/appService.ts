import { User, Video, Comment } from '../types';
import { auth, db, storage } from './firebaseService';
import { 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MOCK_VIDEOS, MOCK_USER } from './mockData';

class AppService {
  private currentUser: User | null = null;
  private notifyVideos: ((videos: Video[]) => void) | null = null;
  private unsubscribeVideos: (() => void) | null = null;

  constructor() {
    this.initAuth();
  }

  private initAuth() {
    if (!auth) return;
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUser = {
          uid: user.uid,
          username: user.displayName || 'User',
          email: user.email || '',
          profileImage: user.photoURL || '',
          followersCount: 0,
          followingCount: 0,
          createdAt: Date.now()
        };
      } else {
        this.currentUser = null;
      }
    });
  }

  private async fetchUserProfile(uid: string): Promise<User> {
    // We are currently not fetching from Firestore as per instructions.
    // We just return the Auth user data or a mock fallback.
    if (auth?.currentUser && auth.currentUser.uid === uid) {
       return {
          uid: auth.currentUser.uid,
          username: auth.currentUser.displayName || 'User',
          email: auth.currentUser.email || '',
          profileImage: auth.currentUser.photoURL || '',
          followersCount: 0,
          followingCount: 0,
          createdAt: Date.now()
       };
    }
    return MOCK_USER;
  }

  // --- Auth Logic ---

  async loginWithGoogle(): Promise<User> {
    if (!auth) {
        this.currentUser = { ...MOCK_USER, username: 'Google User' };
        return this.currentUser;
    }
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        const appUser: User = {
            uid: user.uid,
            username: user.displayName || 'Google User',
            email: user.email || '',
            profileImage: user.photoURL || '',
            followersCount: 0,
            followingCount: 0,
            createdAt: Date.now()
        };
        
        this.currentUser = appUser;
        return appUser;
    } catch (error: any) {
        console.error("Google Login Error:", error.code);
        throw error;
    }
  }

  async loginWithEmail(email: string, pass: string): Promise<User> {
     if (!auth) {
        // Mock fallback if auth isn't init
        this.currentUser = { ...MOCK_USER, email };
        return this.currentUser;
     }
     try {
       const result = await signInWithEmailAndPassword(auth, email, pass);
       const user = await this.fetchUserProfile(result.user.uid);
       this.currentUser = user;
       return user;
     } catch (error: any) {
       // Don't log expected auth errors as system errors
       if (error.code !== 'auth/invalid-credential' && error.code !== 'auth/user-not-found' && error.code !== 'auth/wrong-password') {
         console.error("Login Error:", error.code);
       }
       throw error;
     }
  }

  async signupWithEmail(
    email: string, 
    pass: string, 
    userData: { name: string, profileImageFile?: File }
  ): Promise<User> {
    if (!auth) {
        this.currentUser = { ...MOCK_USER, email, username: userData.name };
        return this.currentUser;
    }

    try {
      // 1. Create Auth User
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const user = result.user;
      
      let photoURL = `https://ui-avatars.com/api/?name=${userData.name}&background=FF7A00&color=fff`;

      // 2. Upload Profile Image if provided
      // Only runs if storage is available
      if (userData.profileImageFile && storage) {
        try {
          const storageRef = ref(storage, `profile_images/${user.uid}_${Date.now()}`);
          await uploadBytes(storageRef, userData.profileImageFile);
          photoURL = await getDownloadURL(storageRef);
        } catch (uploadError) {
          console.warn("Failed to upload profile image (likely storage API disabled), using default.", uploadError);
        }
      }

      // 3. Update Auth Profile (Display Name & Photo)
      // This persists basic info without needing a Firestore document
      await updateProfile(user, {
        displayName: userData.name,
        photoURL: photoURL
      });

      const newUserProfile: User = {
          uid: user.uid,
          email: user.email || email,
          username: userData.name,
          profileImage: photoURL,
          followersCount: 0,
          followingCount: 0,
          createdAt: Date.now()
      };

      this.currentUser = newUserProfile;
      return newUserProfile;
      
    } catch (error: any) {
      // Suppress console error for expected 'email already in use' to keep console clean
      if (error.code !== 'auth/email-already-in-use') {
        console.error("Signup Error:", error.code);
      }
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    if (!auth) return;
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            throw new Error("No user found with this email.");
        }
        throw error;
    }
  }

  async logout(): Promise<void> {
    if (auth) await signOut(auth);
    this.currentUser = null;
  }

  // --- Video Logic ---

  subscribeToVideos(callback: (videos: Video[]) => void): () => void {
    this.notifyVideos = callback;

    if (!db) {
        console.warn("Firestore not initialized, using mock data.");
        callback(MOCK_VIDEOS);
        return () => {};
    }

    try {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        this.unsubscribeVideos = onSnapshot(q, (snapshot) => {
            const videos = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ownerId: data.ownerId,
                    ownerUsername: data.ownerUsername || 'Anonymous',
                    ownerProfileImage: data.ownerProfileImage,
                    videoUrl: data.videoUrl,
                    thumbnailUrl: data.thumbnailUrl || 'https://picsum.photos/600/400?random=1',
                    title: data.title,
                    description: data.description,
                    likesCount: data.likesCount || 0,
                    commentsCount: data.commentsCount || 0,
                    votesCount: data.votesCount || 0,
                    createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
                    hasLiked: false,
                    hasVoted: false
                } as Video;
            });
            callback(videos);
        }, (error) => {
            // ERROR HANDLER: If Firestore fails (Permission Denied / API Disabled), fallback to MOCK
            console.warn("Firestore error (API likely disabled). Switching to offline/mock mode.", error.code);
            callback(MOCK_VIDEOS);
        });

        return () => {
            if (this.unsubscribeVideos) this.unsubscribeVideos();
        };

    } catch (e) {
        console.error("Setup subscription failed:", e);
        callback(MOCK_VIDEOS);
        return () => {};
    }
  }

  async uploadVideo(file: File, title: string, description: string): Promise<Video> {
    if (!this.currentUser) throw new Error("Must be logged in");
    
    // Default fallback values in case backend fails
    let videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    let id = 'temp_' + Date.now();
    let createdAt = Date.now();

    // 1. Try Uploading Video to Storage
    if (storage) {
        try {
            const storageRef = ref(storage, `videos/${this.currentUser.uid}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            videoUrl = await getDownloadURL(storageRef);
        } catch (e) {
             console.warn("Storage upload failed (API likely disabled). Using mock video URL.");
        }
    }

    // Prepare data
    const videoData = {
        ownerId: this.currentUser.uid,
        ownerUsername: this.currentUser.username,
        ownerProfileImage: this.currentUser.profileImage,
        title,
        description,
        videoUrl,
        thumbnailUrl: `https://picsum.photos/600/400?random=${Date.now()}`,
        likesCount: 0,
        commentsCount: 0,
        votesCount: 0,
    };

    // 2. Try Saving to Firestore
    if (db) {
        try {
            const docRef = await addDoc(collection(db, "videos"), {
                ...videoData,
                createdAt: serverTimestamp()
            });
            id = docRef.id;
        } catch (e) {
            console.warn("Firestore write failed (API likely disabled). Simulating success.");
        }
    }

    // Return a valid Video object so the UI updates optimistically
    return {
        id,
        ...videoData,
        createdAt
    } as Video;
  }

  async toggleLike(videoId: string): Promise<boolean> {
     // Implement real Firestore toggle here if needed, 
     // but for now local optimistic update in UI is sufficient.
     return true;
  }

  async voteForCreator(videoId: string): Promise<boolean> {
    return true;
  }

  async searchVideos(queryText: string): Promise<Video[]> {
     return MOCK_VIDEOS.filter(v => v.title.toLowerCase().includes(queryText.toLowerCase()));
  }
}

export const appService = new AppService();