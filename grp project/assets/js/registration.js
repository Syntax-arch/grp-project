// assets/js/registration.js
import { AuthService, supabase, checkDbConnection } from './authService.js';
import { showMessage, isValidEmail, isStrongPassword } from './utils.js';

window.addEventListener('load', async () => {
    // Optional: Check DB Status on Registration Page too
    const statusDiv = document.getElementById('dbStatus');
    if (statusDiv) {
        if (await checkDbConnection()) {
            statusDiv.textContent = 'Database Online';
            statusDiv.className = 'db-status online';
        } else {
            statusDiv.textContent = 'Database Offline. Check RLS Policy.';
            statusDiv.className = 'db-status offline';
        }
    }

    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration();
        });
    }
});

async function handleRegistration() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const employeeId = document.getElementById('employeeId').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const registerBtn = document.getElementById('registerBtn');
    const msgContainer = 'registrationMessages';

    // 1. Basic validation
    if (!fullName || !email || !password || !confirmPassword) {
        showMessage('All required fields must be filled.', 'error', msgContainer);
        return;
    }
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address.', 'error', msgContainer);
        return;
    }
    if (password !== confirmPassword) {
        showMessage('Password and confirmation password do not match.', 'error', msgContainer);
        return;
    }
    // Simple password strength check (if you included it in utils.js)
    // if (!isStrongPassword(password)) {
    //     showMessage('Password must be at least 8 chars and include upper/lower/number/symbol.', 'error', msgContainer);
    //     return;
    // }

    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    registerBtn.disabled = true;
    showMessage('', 'error', msgContainer); // Clear old messages

    try {
        const { user, error } = await AuthService.register(fullName, email, password, employeeId || null);

        if (error) {
            throw new Error(error);
        }

        showMessage('Registration successful! Redirecting to login...', 'success', msgContainer);
        
        setTimeout(() => {
            // Redirect to the manual login page
            window.location.href = 'manual-login.html'; 
        }, 2000);

    } catch (error) {
        console.error("Registration failed:", error);
        showMessage(error.message || 'Registration failed. Please try again.', 'error', msgContainer);
    } finally {
        registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Register Account';
        registerBtn.disabled = false;
    }
}