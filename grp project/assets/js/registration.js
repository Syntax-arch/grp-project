// assets/js/registration.js

import { supabase } from './config.js';
import { Utils } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registrationForm').addEventListener('submit', handleRegistration);
});

async function handleRegistration(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const registerBtn = document.getElementById('registerBtn');

    if (password !== confirmPassword) {
        Utils.showMessage('Passwords do not match!', 'error');
        return;
    }

    if (password.length < 8) {
        Utils.showMessage('Password must be at least 8 characters long.', 'error');
        return;
    }

    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    registerBtn.disabled = true;

    try {
        // 1. Insert new user into the 'users' table
        const { error } = await supabase
            .from('users')
            .insert({ 
                full_name: fullName, 
                email: email, 
                // NOTE: Use a proper hashing function in a real app, 
                // but this matches the AuthService demo logic.
                password_hash: password, 
                is_admin: false,
                is_active: true
            });

        if (error) {
            console.error('Registration Error:', error);
            if (error.code === '23505') { // Unique constraint violation (e.g., email already exists)
                 throw new Error('This email is already registered.');
            }
            throw new Error('Registration failed due to a database error.');
        }

        Utils.showMessage('Account created successfully! Redirecting to login...', 'success');
        
        // Redirect to manual login page
        setTimeout(() => {
            window.location.href = 'manual-login.html';
        }, 2000);

    } catch (error) {
        Utils.showMessage(error.message, 'error');
    } finally {
        registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Register Account';
        registerBtn.disabled = false;
    }
}