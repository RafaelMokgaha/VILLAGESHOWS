import { User, Video, Comment, Notification } from '../types';

export const MOCK_USER: User = {
  uid: 'current-user-123',
  username: 'NeonTraveler',
  email: 'demo@villageshow.com',
  bio: 'Exploring the digital frontier 🌌 | Videographer',
  profileImage: 'https://picsum.photos/200/200?random=100',
  followersCount: 1250,
  followingCount: 340,
  createdAt: Date.now()
};

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'v1',
    ownerId: 'u2',
    ownerUsername: 'CyberPunk_Artist',
    ownerProfileImage: 'https://picsum.photos/200/200?random=1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://picsum.photos/600/400?random=1',
    title: 'Neon Nights in Tokyo 🗼',
    description: 'Walking through the rain in Shinjuku. The lights are mesmerizing.',
    likesCount: 1240,
    commentsCount: 45,
    votesCount: 300,
    createdAt: Date.now() - 3600000,
    hasLiked: false,
    hasVoted: false,
  },
  {
    id: 'v2',
    ownerId: 'u3',
    ownerUsername: 'GlassGlider',
    ownerProfileImage: 'https://picsum.photos/200/200?random=2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://picsum.photos/600/400?random=2',
    title: 'Morning Vibes ☕️',
    description: 'Just a chill morning with some lo-fi beats.',
    likesCount: 890,
    commentsCount: 12,
    votesCount: 150,
    createdAt: Date.now() - 7200000,
    hasLiked: true,
    hasVoted: false,
  },
  {
    id: 'v3',
    ownerId: 'u4',
    ownerUsername: 'RetroWave',
    ownerProfileImage: 'https://picsum.photos/200/200?random=3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://picsum.photos/600/400?random=3',
    title: 'Synthwave Concert 🎹',
    description: 'Live performance from last night! The energy was unreal.',
    likesCount: 5600,
    commentsCount: 320,
    votesCount: 1200,
    createdAt: Date.now() - 86400000,
    hasLiked: false,
    hasVoted: true,
  }
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    videoId: 'v1',
    userId: 'u5',
    username: 'PixelPeeper',
    userProfileImage: 'https://picsum.photos/200/200?random=4',
    text: 'This aesthetic is everything! 🔥',
    timestamp: Date.now() - 100000
  },
  {
    id: 'c2',
    videoId: 'v1',
    userId: 'u6',
    username: 'OrangeFan',
    userProfileImage: 'https://picsum.photos/200/200?random=5',
    text: 'Love the color grading on this.',
    timestamp: Date.now() - 200000
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'current-user-123',
    senderId: 'u2',
    senderName: 'CyberPunk_Artist',
    senderImage: 'https://picsum.photos/200/200?random=1',
    type: 'like',
    message: 'liked your video "Urban Exploration"',
    read: false,
    timestamp: Date.now() - 50000,
    videoId: 'v10'
  },
  {
    id: 'n2',
    userId: 'current-user-123',
    senderId: 'u4',
    senderName: 'RetroWave',
    senderImage: 'https://picsum.photos/200/200?random=3',
    type: 'follow',
    message: 'started following you',
    read: true,
    timestamp: Date.now() - 150000
  }
];