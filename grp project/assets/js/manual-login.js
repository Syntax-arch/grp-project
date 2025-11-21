// assets/js/manual-login.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initial Authentication Check
    if (await AuthService.checkSession()) {
        // If session is active, redirect immediately (handled inside AuthService.checkSession)
        return; 
    }
    
    // 2. Database Status Check
    await checkDatabaseConnection();

    // 3. Attach Form Handler
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // 4. Attach Enter key support to the form
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            // Prevent default form submission and trigger the handleLogin function
            e.preventDefault(); 
            handleLogin(e);
        }
    });
});

async function checkDatabaseConnection() {
    const dbStatus = document.getElementById('dbStatus');
    
    dbStatus.classList.remove('online', 'offline');
    dbStatus.classList.add('connecting');
    dbStatus.innerHTML = '<i class="fas fa-network-wired fa-spin"></i> Checking System Status...';
    
    try {
        // Use a simple Supabase query check
        const { error } = await supabase
            .from('users')
            .select('id', { head: true, count: 'exact' }); // Lightweight check

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
        Utils.showMessage('The secure system database is currently unreachable. Please contact support.', 'error', 'loginMessages');
    }
}

async function handleLogin(e) {
    e.preventDefault(); // Stop default form submission
    
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
        // Use the centralized AuthService for login
        await AuthService.login(email, password);
        
        // AuthService handles session storage, history logging, and redirection on success
        Utils.showMessage('Login successful! Redirecting...', 'success', 'loginMessages');

        setTimeout(() => {
            window.location.href = 'main-menu.html';
        }, 1000);

    } catch (error) {
        // AuthService will have already logged the failed attempt
        Utils.showMessage(error.message, 'error', 'loginMessages');
    } finally {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        loginBtn.disabled = false;
    }
}