// config.js - SIMPLIFIED VERSION
console.log('Loading config.js...');

const SUPABASE_URL = 'https://nfcjbjohxzaikelxgmjg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mY2piam9oeHphaWtlbHhnbWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTgzMjAsImV4cCI6MjA3NjYzNDMyMH0.u0ta1NxSDbJ_9lf1TcMp3M0-_vNNBs6HByOj8wtKsX4';

// Initialize Supabase
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
console.log('Supabase client created');

// Simple Auth Service
window.AuthService = {
    async login(email, password) {
        console.log('Login called with:', email);
        
        try {
            // Get user from database
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('is_active', true)
                .single();

            console.log('Database response:', { user, error });

            if (error || !user) {
                throw new Error('Invalid email or password');
            }

            // Simple password check
            if (user.password_hash !== password) {
                throw new Error('Invalid email or password');
            }

            // Store user session
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('isAuthenticated', 'true');
            
            console.log('Login successful, user stored');
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
        window.location.href = 'index.html';
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return user ? user.is_admin : false;
    }
};

// Placeholder for registration function (needed for registration.html to call it)
window.AuthService.register = async (fullName, email, password, employeeId, faceData) => {
    console.log('Registration called with:', { fullName, email, employeeId });

    // Simple validation (can be more complex)
    if (!fullName || !email || !password) {
        throw new Error("All fields are required.");
    }

    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (existingUser) {
        throw new Error('User with this email already exists.');
    }
    
    // Simulate complex face data storage
    const uniqueFaceID = faceData ? 'FACE-' + Date.now() : null;

    // Insert new user into the database
    const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
            full_name: fullName,
            email: email,
            password_hash: password, // WARNING: In a real app, hash this password!
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
};

// Utility function to check database connection status
async function checkDbConnection() {
    try {
        // Ping a small, fast table (e.g., users)
        const { data, error } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true });
        
        if (error) {
            console.error("DB check failed:", error);
            return false;
        }
        return true;
    } catch (e) {
        console.error("DB check exception:", e);
        return false;
    }
}