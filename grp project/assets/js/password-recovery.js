// assets/js/password-recovery.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';

let recoveryEmail = '';

document.addEventListener('DOMContentLoaded', () => {
    // Attach handlers
    document.getElementById('verifyEmailBtn').addEventListener('click', verifyEmail);
    document.getElementById('verifyCodeBtn').addEventListener('click', verifyCode);
    document.getElementById('resetPasswordBtn').addEventListener('click', resetPassword);
    
    // Attach Enter key support
    document.getElementById('recoveryEmail').addEventListener('keypress', (e) => { if (e.key === 'Enter') verifyEmail(); });
    // ... attach keypress for code and password fields
});

async function verifyEmail() {
    const email = document.getElementById('recoveryEmail').value.trim();
    if (!Utils.isValidEmail(email)) {
        Utils.showMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    // In a real app, use Supabase's password recovery method:
    // const { error } = await supabase.auth.resetPasswordForEmail(email);

    // MOCKING the Supabase call and flow:
    Utils.showMessage('Verification code sent to your email (mocked).', 'success');
    recoveryEmail = email;
    
    // Advance to next step
    document.getElementById('emailStep').style.display = 'none';
    document.getElementById('codeStep').style.display = 'block';
}

function verifyCode() {
    const code = document.getElementById('verificationCode').value.trim();
    if (code.length < 6) {
        Utils.showMessage('Please enter the full verification code.', 'error');
        return;
    }
    
    // In a real app, this would verify the code against Supabase/server:
    // const { user, error } = await supabase.auth.verifyOTP({ email: recoveryEmail, token: code, type: 'recovery' });

    // MOCKING success:
    Utils.showMessage('Code verified successfully (mocked). Please set your new password.', 'success');
    
    // Advance to next step
    document.getElementById('codeStep').style.display = 'none';
    document.getElementById('passwordStep').style.display = 'block';
}

function resetPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        Utils.showMessage('Passwords do not match.', 'error');
        return;
    }

    if (!Utils.isStrongPassword(newPassword)) {
        Utils.showMessage('Password is not strong enough.', 'error');
        return;
    }
    
    // In a real app, use Supabase method to update password:
    // const { error } = await supabase.auth.updateUser({ password: newPassword });

    // MOCKING success:
    Utils.showMessage('Password reset successfully! Redirecting to login...', 'success');
    
    setTimeout(() => {
        window.location.href = 'manual-login.html';
    }, 2000);
}