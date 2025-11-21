// assets/js/authService.js

// 🛑 THESE ARE YOUR CORRECT SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://jyskbnmmehahbtqvldsn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5c2tibm1tZWhhaGJ0cXZsZHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Nzg3MDksImV4cCI6MjA3OTI1NDcwOX0.dLiIQD3gflP-yOYjJe1eeZc8Kqzg-h9NGRljCY-XtW0';

// Initialize Supabase client: FIX for the ReferenceError
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to check the database connection status
export async function checkDbConnection() {
    try {
        const { error } = await supabase
            .from('users') 
            .select('id', { count: 'exact', head: true });
        
        return !error;
    } catch (e) {
        console.error("Connection check failed:", e);
        return false;
    }
}

export const AuthService = {
    async login(email, password) {
        try {
            // RLS Policy MUST allow SELECT for 'anon' users to run this query
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('is_active', true)
                .single();

            if (error) {
                throw new Error(error.message || 'Authentication failed. Check your RLS policy and database.');
            }
            if (!user) {
                 throw new Error('Invalid email or password.');
            }

            if (user.password_hash !== password) {
                throw new Error('Invalid email or password.');
            }

            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('isAuthenticated', 'true');
            
            return { user, error: null };

        } catch (error) {
            return { user: null, error: error.message };
        }
    },

    // 💥 NEW: The missing function for registration
    async register(name, email, password, employee_id = null) {
        try {
            // Password storage: For now, we store plain text for simplicity.
            const passwordHash = password; 

            // RLS Policy MUST allow INSERT for 'anon' users to run this query
            const { data, error } = await supabase
                .from('users')
                .insert({
                    full_name: name,
                    email: email,
                    password_hash: passwordHash, 
                    employee_id: employee_id,
                    is_active: true,
                    is_admin: false
                })
                .select()
                .single();

            if (error) {
                if (error.code === '23505') { // PostgreSQL unique violation error code
                    throw new Error('Registration failed: An account with this email already exists.');
                }
                throw new Error(error.message || 'Registration failed due to a server error.');
            }

            return { user: data, error: null };

        } catch (error) {
            console.error('Registration error:', error);
            return { user: null, error: error.message };
        }
    },
    
    // ... rest of the AuthService methods ...
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