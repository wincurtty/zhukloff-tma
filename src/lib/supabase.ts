import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Временное решение для сборки
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Типы для TypeScript
export type Order = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  service_type: 'web_design' | 'branding' | 'ui_ux' | 'other' | null;
  budget: number | null;
  deadline: string | null;
  status: 'draft' | 'brief_received' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type OrderStage = {
  id: string;
  order_id: string;
  name: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  order_index: number;
  created_at: string;
};

export type OrderComment = {
  id: string;
  order_id: string;
  author_id: string;
  content: string;
  attachment_url: string | null;
  is_internal: boolean;
  created_at: string;
  profiles?: {
    first_name: string;
    username: string;
  };
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  category: 'web_design' | 'ui_ux' | 'branding' | 'motion';
  client_name: string | null;
  project_url: string | null;
  duration: string | null;
  budget: number | null;
  technologies: string[] | null;
  images: string[];
  before_images: string[] | null;
  after_images: string[] | null;
  featured: boolean;
  order_index: number;
  created_at: string;
};