import { createClient } from '@supabase/supabase-js';
import { ClinicData, INITIAL_DATA } from '../types';

const SUPABASE_URL = 'https://ionklmzfvsbbbbdakwhl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbmtsbXpmdnNiYmJiZGFrd2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTQ3MTEsImV4cCI6MjA3OTg3MDcxMX0.fAuimBEH6f5eCHS0UFj_NdU4WIx77v7fKvz6kok9lUg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseService = {
  // Auth
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Data
  loadData: async (): Promise<ClinicData | null> => {
    const user = await supabaseService.getUser();
    if (!user) return null;

    // Try to select 'rx' column along with 'content' just in case it exists in the schema
    // If it doesn't exist, Supabase might return error or just ignore it.
    // For safety, we select everything or specific columns if we knew schema was updated.
    // Here we try to select all (*) to get 'rx' if created by user.
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No row found, return initial data
        return INITIAL_DATA;
      }
      console.error('Error loading data:', error);
      return null;
    }

    const content = data.content || {};
    // If 'rx' column exists and has a value, inject it into settings
    if (data.rx && typeof data.rx === 'string') {
        if (!content.settings) content.settings = { ...INITIAL_DATA.settings };
        content.settings.rxBackgroundImage = data.rx;
    }

    // Merge with initial data structure to ensure new fields exist
    return { ...INITIAL_DATA, ...content };
  },

  saveData: async (clinicData: ClinicData) => {
    const user = await supabaseService.getUser();
    if (!user) return;

    // Check if row exists to decide between insert/update
    const { data: existing } = await supabase
      .from('user_data')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Update
      // We only update 'content'. If 'rx' column was real, we would update it separately
      // e.g. .update({ content: clinicData, rx: clinicData.settings.rxBackgroundImage })
      // For now we assume safety with content JSON
      const { error } = await supabase
        .from('user_data')
        .update({ content: clinicData })
        .eq('id', existing.id);
      
      if (error) console.error('Error updating data:', error);
    } else {
      // Insert
      const { error } = await supabase
        .from('user_data')
        .insert({ user_id: user.id, content: clinicData });

      if (error) console.error('Error inserting data:', error);
    }
  }
};