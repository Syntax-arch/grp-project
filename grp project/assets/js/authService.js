// assets/js/authService.js

// 🛑 WARNING: Using your latest provided key and URL
const SUPABASE_URL = 'https://jyskbnmmehahbtqvldsn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5c2tibm1tZWhhaGJ0cXZsZHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Nzg3MDksImV4cCI6MjA3OTI1NDcwOX0.dLiIQD3gflP-yOYjJe1eeZc8Kqzg-h9NGRljCY-XtW0';

// Initialize Supabase client
export const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to check the database connection status
export async function checkDbConnection() {
    try {
        // Attempt a lightweight SELECT query that requires an RLS policy
        const { error } = await supabase
            .from('users') 
            .select('id', { count: 'exact', head: true });
        
        return !error;
    } catch (e) {
        console.error("Connection check failed:", e);
        return false;
    }
}

// Service object containing core authentication logic
export const AuthService = {
    async login(email, password) {
        try {
            // Get user from database
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('is_active', true)
                .single();

            if (error) {
                 // RLS or other database errors will land here
                throw new Error(error.message || 'Authentication failed. Check RLS policy.');
            }
            if (!user) {
                // No user found with that email
                 throw new Error('Invalid email or password.');
            }

            // Simple password check (replace with secure hashing later)
            if (user.password_hash !== password) {
                throw new Error('Invalid email or password.');
            }

            // Store user session
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('isAuthenticated', 'true');
            
            return { user, error: null };

        } catch (error) {
            console.error('Login error:', error);
            return { user: null, error: error.message };
        }
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated() {
        return localStorage.getItem('isAuthenticated') === 'true';
    },

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticated');
        // Assumes index.html is in the parent directory
        window.location.href = '../index.html'; 
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return user ? user.is_admin : false;
    }
};