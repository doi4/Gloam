import {
  Post,
  MOCK_FRIENDS_POSTS,
  MOCK_LOCAL_POSTS,
  MOCK_GLOBAL_POSTS,
} from './mock-data';

type Listener = () => void;

class SocialService {
  private friendsPosts: Post[] = [...MOCK_FRIENDS_POSTS];
  private localPosts: Post[] = [...MOCK_LOCAL_POSTS];
  private globalPosts: Post[] = [...MOCK_GLOBAL_POSTS];
  private listeners: Listener[] = [];

  getFriendsPosts(): Post[] {
    return [...this.friendsPosts];
  }

  // Automatically shows posts from the user's current city
  getLocalPosts(): Post[] {
    return [...this.localPosts];
  }

  // Shows posts from world sunset hotspots with optional hotspot filter
  getGlobalPosts(hotspotFilter?: string): Post[] {
    if (!hotspotFilter || hotspotFilter === 'All Hotspots' || hotspotFilter === 'All') {
      return [...this.globalPosts];
    }
    return this.globalPosts.filter(
      (p) =>
        (p.hotspot && p.hotspot.toLowerCase().includes(hotspotFilter.toLowerCase())) ||
        p.location.toLowerCase().includes(hotspotFilter.toLowerCase())
    );
  }

  getPublicPosts(locationFilter?: string): Post[] {
    return this.getGlobalPosts(locationFilter);
  }

  addPost(
    post: Omit<Post, 'id' | 'timestamp' | 'userId' | 'userAvatar'>,
    target: 'friends' | 'local' | 'global' | 'both' | 'public'
  ) {
    const newPost: Post = {
      ...post,
      id: `post_${Date.now()}`,
      userId: 'currentUser',
      username: 'you',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      timestamp: 'Just now',
    };

    if (target === 'friends' || target === 'both') {
      this.friendsPosts = [newPost, ...this.friendsPosts];
    }
    if (target === 'local' || target === 'both' || target === 'public') {
      this.localPosts = [newPost, ...this.localPosts];
    }
    if (target === 'global' || target === 'both' || target === 'public') {
      this.globalPosts = [newPost, ...this.globalPosts];
    }

    this.notify();
    return newPost;
  }

  toggleLike(postId: string) {
    const update = (posts: Post[]) =>
      posts.map((p) => {
        if (p.id === postId) {
          const currentLikes = p.likes ?? 12;
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
          };
        }
        return p;
      });

    this.friendsPosts = update(this.friendsPosts);
    this.localPosts = update(this.localPosts);
    this.globalPosts = update(this.globalPosts);
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const socialService = new SocialService();
