import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export interface Match {
  id: string;
  winner_id: string;
  loser_id: string;
  score: string;
  played_at: string;
}

export type Database = {
  public: {
    Tables: {
      matches: {
        Row: Match;
        Insert: Omit<Match, 'id' | 'played_at'> & { played_at?: string };
        Update: Partial<Omit<Match, 'id'>>;
      };
    };
  };
};

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
