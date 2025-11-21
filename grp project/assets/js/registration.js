// assets/js/registration.js
import { AuthService, supabase } from './authService.js';
import { showMessage, isValidEmail, isStrongPassword } from './utils.js';

window.addEventListener('load', () => {
    // Attach Event Listener to the form ID
    document.getElementById('registrationForm')?.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevents page reload
        handleRegistration();
    });

    // Enter key support
    document.getElementById('regConfirmPassword')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleRegistration();
        }
    });
});

async function handleRegistration() {
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const employeeId = document.getElementById('regEmployeeId').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const registerBtn = document.getElementById('registerBtn');
    const processingOverlay = document.getElementById('processingOverlay');
    
    const msgContainer = 'message';

    showMessage('', 'error', msgContainer);
    
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address.', 'error', msgContainer);
        return;
    }
    
    if (!isStrongPassword(password)) {
        showMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.', 'error', msgContainer);
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match.', 'error', msgContainer);
        return;
    }
    
    const faceData = 'SIMULATED_FACE_DATA_' + Date.now(); 

    registerBtn.disabled = true;
    processingOverlay.style.display = 'flex';

    try {
        const { user, error } = await AuthService.register(fullName, email, password, employeeId, faceData);
        
        if (error) {
            throw new Error(error);
        }

        setTimeout(async () => {
            processingOverlay.style.display = 'none';
            showMessage('✅ Account successfully created! Redirecting to login...', 'success', msgContainer);
            
            await supabase
                .from('access_history')
                .insert({
                    user_id: user.id,
                    access_type: 'registration',
                    status: 'success',
                    device_info: navigator.userAgent,
                    location: 'Registration Page'
                });
                
            setTimeout(() => {
                // Stays in the same directory (pages/)
                window.location.href = 'manual-login.html'; 
            }, 3000);
        }, 2000);

    } catch (error) {
        processingOverlay.style.display = 'none';
        showMessage(error.message || 'Registration failed. Please try again.', 'error', msgContainer);
        registerBtn.disabled = false;
    }
}