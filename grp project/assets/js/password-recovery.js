// assets/js/password-recovery.js

import { supabase } from './config.js';
import { Utils } from './utils.js';

let recoveryEmail = '';
let verificationCode = '';

window.verifyEmail = async () => {
    const email = document.getElementById('recoveryEmail').value.trim();
    if (!email) {
        Utils.showMessage('Please enter your email.', 'error');
        return;
    }
    
    // In a real app, this would trigger an email from your server/Supabase Auth
    // Since we're using custom logic, we'll simulate it.
    
    // Check if user exists first
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (!user) {
        Utils.showMessage('Email not found. Please try again.', 'error');
        return;
    }

    // SIMULATION: Generate and store a code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    recoveryEmail = email;
    verificationCode = code;
    console.log(`[SIMULATION] Recovery Code for ${email}: ${code}`);
    
    // UI Update
    Utils.showMessage(`Verification code sent to ${email} (Check console for simulation).`, 'success');
    document.getElementById('emailStep').style.display = 'none';
    document.getElementById('codeStep').style.display = 'block';
};

window.verifyCode = () => {
    const enteredCode = document.getElementById('verificationCode').value.trim();

    if (enteredCode === verificationCode) {
        Utils.showMessage('Code verified successfully!', 'success');
        document.getElementById('codeStep').style.display = 'none';
        document.getElementById('passwordStep').style.display = 'block';
    } else {
        Utils.showMessage('Invalid verification code.', 'error');
    }
};

window.resetPassword = async () => {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        Utils.showMessage('Passwords do not match.', 'error');
        return;
    }

    if (newPassword.length < 8) {
        Utils.showMessage('Password must be at least 8 characters.', 'error');
        return;
    }

    try {
        // Update password in the 'users' table
        const { error } = await supabase
            .from('users')
            .update({ password_hash: newPassword })
            .eq('email', recoveryEmail);

        if (error) throw error;

        Utils.showMessage('Password reset successfully! Redirecting to login...', 'success');
        
        // Cleanup and redirect
        verificationCode = '';
        recoveryEmail = '';
        setTimeout(() => {
            window.location.href = 'manual-login.html';
        }, 2000);

    } catch (error) {
        console.error('Password reset error:', error);
        Utils.showMessage('Failed to reset password. Please try again.', 'error');
    }
};