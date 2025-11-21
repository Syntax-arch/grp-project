// assets/js/config.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ⚠️ YOUR PROJECT-SPECIFIC CREDENTIALS
export const SUPABASE_URL = 'https://jyskbnmmehahbtqvldsn.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5c2tibm1tZWhhaGJ0cXZsZHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Nzg3MDksImV4cCI6MjA3OTI1NDcwOX0.dLiIQD3gflP-yOYjJe1eeZc8Kqzg-h9NGRljCY-XtW0';

// Initialize the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Supabase Client Initialized.");