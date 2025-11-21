// assets/js/registration.js

// Import services and utilities from their modules
import { AuthService } from './authService.js';
import { Utils } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registrationForm');
    
    if (registerForm) {
        const submitBtn = document.getElementById('registerBtn');
        registerForm.addEventListener('submit', (e) => handleRegistration(e, submitBtn));
    } else {
        console.error('Registration form or button not found.');
    }

    async function handleRegistration(e, submitBtn) {
        e.preventDefault();
        
        const fullName = document.getElementById('regFullName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const messageDiv = 'message';

        // --- Step 1: Validation ---
        if (!fullName || !email || !password || !confirmPassword) {
            Utils.showMessage('All fields are required.', 'error', messageDiv);
            return;
        }

        if (password !== confirmPassword) {
            Utils.showMessage('Passwords do not match.', 'error', messageDiv);
            return;
        }
        
        if (!Utils.isValidEmail(email)) {
            Utils.showMessage('Please enter a valid email address.', 'error', messageDiv);
            return;
        }

        // Use centralized strong password check
        if (!Utils.isStrongPassword(password)) {
            Utils.showMessage('Password is not strong enough. Requires 8+ characters, uppercase, lowercase, number, and special character.', 'error', messageDiv);
            return;
        }

        // --- Step 2: Submission ---
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
        submitBtn.disabled = true;

        try {
            // Use the secure, centralized AuthService
            const { user } = await AuthService.register(email, password, fullName);

            Utils.showMessage(`Account created for ${user.email}. Redirecting to login...`, 'success', messageDiv);
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'manual-login.html';
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            Utils.showMessage(error.message || 'Error creating account. Please try again.', 'error', messageDiv);

        } finally {
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Register';
            submitBtn.disabled = false;
        }
    }
});