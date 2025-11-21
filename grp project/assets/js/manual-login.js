// assets/js/manual-login.js
import { AuthService, supabase, checkDbConnection } from './authService.js';
import { showMessage } from './utils.js';

window.addEventListener('load', async () => {
    console.log('manual-login.js loaded. Checking DB status...');
    
    // 1. Check DB Status
    const statusDiv = document.getElementById('dbStatus');
    if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = '<i class="fas fa-network-wired fa-spin"></i> Checking System Status...';
        statusDiv.className = 'db-status connecting';

        if (await checkDbConnection()) {
            statusDiv.textContent = 'Database Online';
            statusDiv.className = 'db-status online';
        } else {
            statusDiv.textContent = 'Database Offline. Functionality limited.';
            statusDiv.className = 'db-status offline';
        }
    }

    // 2. Attach Event Listeners
    const loginForm = document.getElementById('loginForm');
    
    // Check if the form element was found. THIS IS CRITICAL.
    if (loginForm) {
        console.log('Form ID (loginForm) found. Attaching submit listener.');
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevents page reload
            console.log('Login Form Submit Event Fired.'); // LOGGING FOR DEBUG
            handleLogin();
        });
    } else {
        console.error('CRITICAL ERROR: loginForm ID not found in HTML. Button will do nothing!');
        showMessage('System Error: Login form not found. Check HTML IDs.', 'error', 'loginMessages');
    }

    // Allow form submission with Enter key on password field
    document.getElementById('password')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
});

async function handleLogin() {
    console.log('handleLogin function started.'); // LOGGING FOR DEBUG
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginBtn = document.getElementById('loginBtn');
    
    const msgContainer = 'loginMessages';

    if (!email || !password) {
        showMessage('Please enter both email and password.', 'error', msgContainer);
        console.log('Validation failed: Missing email or password.');
        return;
    }

    // These lines should immediately update the button. If they don't, something is wrong with the IDs or the showMessage function.
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;
    showMessage('', 'error', msgContainer); 

    try {
        console.log(`Attempting login for: ${email}`);
        
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
            // Assumes main-menu.html is in the parent directory of pages/
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