// assets/js/manual-login.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';
import { supabase } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initial Authentication Check
    if (AuthService.getCurrentUser()) {
        window.location.href = 'main-menu.html'; 
        return; 
    }
    
    // 2. Database Status Check (Optional but good practice)
    await checkDatabaseConnection();

    // 3. Attach Form Handler
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
});

async function checkDatabaseConnection() {
    const dbStatus = document.getElementById('dbStatus');
    
    dbStatus.classList.remove('online', 'offline');
    dbStatus.classList.add('connecting');
    dbStatus.innerHTML = '<i class="fas fa-network-wired fa-spin"></i> Checking System Status...';
    dbStatus.style.display = 'block';
    
    try {
        // Use a simple Supabase query check
        const { error } = await supabase
            .from('users')
            .select('id', { head: true, count: 'exact' }); 

        if (error) throw error;

        dbStatus.classList.remove('connecting');
        dbStatus.classList.add('online');
        dbStatus.innerHTML = '✅ System Ready (Database Online)';
        
        setTimeout(() => {
            dbStatus.style.display = 'none';
        }, 3000);
        
    } catch (err) {
        dbStatus.classList.remove('connecting');
        dbStatus.classList.add('offline');
        dbStatus.innerHTML = '⚠️ Database Connection Error. Cannot Log In.';
        Utils.showMessage('The secure system database is currently unreachable.', 'error', 'loginMessages');
    }
}

async function handleLogin(e) {
    e.preventDefault(); 
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    
    if (!email || !password) {
        Utils.showMessage('Please fill in all fields', 'error', 'loginMessages');
        return;
    }

    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;

    try {
        await AuthService.login(email, password);
        
        Utils.showMessage('Login successful! Redirecting...', 'success', 'loginMessages');

        setTimeout(() => {
            window.location.href = 'main-menu.html';
        }, 1000);

    } catch (error) {
        Utils.showMessage(error.message, 'error', 'loginMessages');
    } finally {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        loginBtn.disabled = false;
    }
}