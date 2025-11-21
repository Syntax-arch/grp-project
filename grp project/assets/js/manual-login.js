// assets/js/manual-login.js
import { AuthService, supabase, checkDbConnection } from './authService.js';
import { showMessage } from './utils.js';

window.addEventListener('load', async () => {
    
    // 1. Database Status Check
    const statusDiv = document.getElementById('dbStatus');
    if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = '<i class="fas fa-network-wired fa-spin"></i> Checking System Status...';
        statusDiv.className = 'db-status connecting';

        // This is where the long wait occurs if the key or RLS policy is wrong
        if (await checkDbConnection()) {
            statusDiv.textContent = 'Database Online';
            statusDiv.className = 'db-status online';
        } else {
            statusDiv.textContent = 'Database Offline. Check keys and RLS Policy.';
            statusDiv.className = 'db-status offline';
        }
    }

    // 2. Attach Event Listener to the form
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevents page reload
            handleLogin();
        });
    } else {
        showMessage('System Error: Login form ID missing.', 'error', 'loginMessages');
    }

    // Allow form submission with Enter key on password field
    document.getElementById('password')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
});

async function handleLogin() {
    // Before (The path your server was struggling to resolve):
// window.location.href = 'main-menu.html';

// Now (The dynamic path that guarantees success):
const currentPath = window.location.pathname;
const newPath = currentPath.replace('manual-login.html', 'main-menu.html');
window.location.pathname = newPath;
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginBtn = document.getElementById('loginBtn');
    
    const msgContainer = 'loginMessages';

    if (!email || !password) {
        showMessage('Please enter both email and password.', 'error', msgContainer);
        return;
    }

    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;
    showMessage('', 'error', msgContainer); 

    try {
        const { user, error } = await AuthService.login(email, password);

        if (error) {
            throw new Error(error);
        }

        showMessage('Login successful! Redirecting...', 'success', msgContainer);
        
        // Log successful attempt
        await supabase
            .from('access_history')
            .insert({
                user_id: user.id,
                access_type: 'manual_login',
                status: 'success',
                device_info: navigator.userAgent,
                location: 'Manual Login Page'
            });

        setTimeout(() => {
            // Redirect to the main menu page
            window.location.href = '../main-menu.html'; 
        }, 1500);

    } catch (error) {
        console.error("Login failed:", error);
        showMessage(error.message || 'Login failed. Check credentials.', 'error', msgContainer);
        
        // Log failed attempt
        await supabase
            .from('access_history')
            .insert({
                user_id: null,
                access_type: 'manual_login',
                status: 'failed',
                device_info: navigator.userAgent,
                location: 'Manual Login Page'
            });
    } finally {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        loginBtn.disabled = false;
    }
}