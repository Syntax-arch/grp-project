// config.js - Using the CORRECT Supabase Anon Public Key
// (The one starting with 'eyJ...')
const SUPABASE_URL = 'https://jyskbnmmehahbtqvldsn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5c2tibm1tZWhhaGJ0cXZsZHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Nzg3MDksImV4cCI6MjA3OTI1NDcwOX0.dLiIQD3gflP-yOYjJe1eeZc8Kqzg-h9NGRljCY-XtW0';

// Initialize Supabase and make it available globally
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to check the database connection status
window.checkDbConnection = async function() {
    try {
        const { error } = await window.supabase
            .from('users') 
            .select('id', { count: 'exact', head: true });
        return !error;
    } catch (e) {
        return false;
    }
}

// Simple Auth Service
window.AuthService = {
    async login(email, password) {
        try {
            const { data: user, error } = await window.supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('is_active', true)
                .single();

            if (error || !user) {
                throw new Error(error?.message || 'Invalid email or password');
            }

            if (user.password_hash !== password) {
                throw new Error('Invalid email or password');
            }

            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('isAuthenticated', 'true');
            
            return { user, error: null };

        } catch (error) {
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
        window.location.href = '../index.html';
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return user ? user.is_admin : false;
    }
};