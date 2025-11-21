// assets/js/authService.js

// NOTE: Keep the Supabase keys from your original config.js
const SUPABASE_URL = 'https://nfcjbjohxzaikelxgmjg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mY2piam9oeHphaWtlbHhnbWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTgzMjAsImV4cCI6MjA3NjYzNDMyMH0.u0ta1NxSDbJ_9lf1TcMp3M0-_vNNBs6HByOj8wtKsX4';

// Initialize Supabase Client
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
console.log('Supabase client initialized via AuthService');

/**
 * 🔑 AuthService Module: Handles all secure authentication operations.
 */
export const AuthService = {

    /**
     * Secure Login function using Supabase's built-in signInWithPassword.
     * This handles password hashing and comparison server-side.
     */
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            // Throw a custom error message to be caught by the UI logic
            throw new Error(error.message || 'Authentication failed. Check credentials.');
        }

        // The old, insecure method of storing flags is removed. We rely on the session/token.
        return { user: data.user, error: null };
    },
    
    /**
     * Secure Registration function using Supabase's built-in signUp.
     */
    async register(email, password, fullName) {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    is_admin: false // Default new users to non-admin
                }
            }
        });

        if (error) {
            throw new Error(error.message || 'Registration failed.');
        }
        
        // Insert additional data into your 'users' table if needed, using the returned user ID
        // Note: In a professional setup, use Supabase's triggers/functions for this.
        
        return { user: data.user, error: null };
    },

    async getCurrentUser() {
        // Fetch the user data from the current session
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    async isAuthenticated() {
        const user = await this.getCurrentUser();
        return !!user; // Returns true if a user object exists
    },

    async logout() {
        await supabase.auth.signOut();
        // Redirect to the main login page (adjust path as necessary)
        window.location.href = '../index.html'; 
    },

    async isAdmin() {
        const user = await this.getCurrentUser();
        // Check a user metadata field (as stored during registration)
        return user ? user.user_metadata?.is_admin === true : false;
    }
};