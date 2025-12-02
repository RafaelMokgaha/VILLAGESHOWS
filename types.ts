export interface User {
  uid: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  bio?: string;
  profileImage?: string;
  followersCount: number;
  followingCount: number;
  createdAt: number;
}

export interface Video {
  id: string;
  ownerId: string;
  ownerUsername: string;
  ownerProfileImage?: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  likesCount: number;
  commentsCount: number;
  votesCount: number;
  createdAt: number;
  hasLiked?: boolean; // Local state helper
  hasVoted?: boolean; // Local state helper
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  username: string;
  userProfileImage?: string;
  text: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  userId: string; // Recipient
  senderId: string;
  senderName: string;
  senderImage?: string;
  type: 'like' | 'comment' | 'follow' | 'vote';
  message: string;
  read: boolean;
  timestamp: number;
  videoId?: string;
}

export enum AuthState {
  LOADING,
  AUTHENTICATED,
  UNAUTHENTICATED
}

// Navigation Tab Types
export enum Tab {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  UPLOAD = 'UPLOAD',
  ACTIVITY = 'ACTIVITY',
  PROFILE = 'PROFILE'
}