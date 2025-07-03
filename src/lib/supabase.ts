import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Question {
  id: string;
  text: string;
  author_name: string;
  is_anonymous: boolean;
  likes: number;
  relates?: number;
  answered: boolean;
  answer?: string;
  answer_timestamp?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatRoom {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  participants: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  text: string;
  author_name: string;
  is_pastor: boolean;
  created_at: string;
}

export interface EmailSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface QuestionLike {
  id: string;
  question_id: string;
  user_identifier: string;
  created_at: string;
}

export interface QuestionRelate {
  id: string;
  question_id: string;
  user_identifier: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimony {
  id: string;
  author_name: string;
  age?: number;
  title: string;
  content: string;
  is_anonymous: boolean;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}