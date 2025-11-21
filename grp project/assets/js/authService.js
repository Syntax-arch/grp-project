// assets/js/authService.js
console.log('Loading authService.js...');

// Supabase Credentials (from your config.js)
const SUPABASE_URL = 'https://nfcjbjohxzaikelxgmjg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mY2piam9oeHphaWtlbHhnbWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTgzMjAsImV4cCI6MjA3NjYzNDMyMH0.u0ta1NxSDbJ_9lf1TcMp3M0-_vNNBs6HByOj8wtKsX4';

// Initialize Supabase and EXPORT it
export const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
console.log('Supabase client created (AuthService)');

// Utility function to check database connection status
export async function checkDbConnection() {
    try {
        const { error } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true });
        
        return !error;
    } catch (e) {
        return false;
    }
}

// Simple Auth Service object
export const AuthService = {
    async login(email, password) {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('is_active', true)
                .single();

            if (error || !user) {
                throw new Error('Invalid email or password');
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

    async register(fullName, email, password, employeeId, faceData) {
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            throw new Error('User with this email already exists.');
        }
        
        const uniqueFaceID = faceData ? 'FACE-' + Date.now() : null;

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{
                full_name: fullName,
                email: email,
                password_hash: password, 
                employee_id: employeeId || null,
                is_active: true,
                is_admin: false,
                face_id: uniqueFaceID,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (insertError) {
            console.error("Supabase Insert Error:", insertError);
            throw new Error('Database registration failed. Please try again.');
        }

        return { user: newUser, error: null };
    },
    
    // ... (rest of AuthService methods from previous step)
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
        // Correct path for pages in a subdirectory
        window.location.href = '../index.html'; 
    }
};