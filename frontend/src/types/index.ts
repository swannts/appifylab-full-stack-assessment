export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface LikeUser {
  id: string;
  name: string;
}

export interface Reply {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  liked: boolean;
  liked_by_users?: LikeUser[];
  author: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  liked: boolean;
  liked_by_users?: LikeUser[];
  author: {
    id: string;
    first_name: string;
    last_name: string;
  };
  replies: Reply[];
}

export interface Post {
  id: string;
  author_id: string;
  content: string | null;
  image_url: string | null;
  visibility: boolean;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  liked: boolean;
  liked_by_users?: LikeUser[];
  author: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  comments: Comment[];
}
