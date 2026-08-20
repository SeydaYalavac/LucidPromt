export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      prompts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          content: string;
          model_tag: string | null;
          forked_from_prompt_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          content: string;
          model_tag?: string | null;
          forked_from_prompt_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          content?: string;
          model_tag?: string | null;
          forked_from_prompt_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      threads: {
        Row: {
          id: string;
          author_id: string;
          prompt_id: string | null;
          title: string;
          slug: string;
          body: string;
          tags: string[];
          resolved_reply_id: string | null;
          upvote_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          prompt_id?: string | null;
          title: string;
          slug: string;
          body: string;
          tags?: string[];
          resolved_reply_id?: string | null;
          upvote_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          prompt_id?: string | null;
          title?: string;
          slug?: string;
          body?: string;
          tags?: string[];
          resolved_reply_id?: string | null;
          upvote_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      replies: {
        Row: {
          id: string;
          thread_id: string;
          author_id: string;
          body: string;
          is_solution: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          author_id: string;
          body: string;
          is_solution?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          author_id?: string;
          body?: string;
          is_solution?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          thread_id: string | null;
          reply_id: string | null;
          value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          thread_id?: string | null;
          reply_id?: string | null;
          value: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          thread_id?: string | null;
          reply_id?: string | null;
          value?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
  };
};
