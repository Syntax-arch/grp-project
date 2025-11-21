// assets/js/error-screen.js

// No need to import AuthService or Utils, but good practice to include them for completeness
// import { AuthService } from './authService.js';
// import { Utils } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const dynamicErrorMessage = document.getElementById('dynamicErrorMessage');
    
    // Get URL parameter for specific error message
    const urlParams = new URLSearchParams(window.location.search);
    const errorMsg = urlParams.get('error');

    if (errorMsg) {
        dynamicErrorMessage.innerHTML = `Error details: <strong>${decodeURIComponent(errorMsg)}</strong>`;
    }

    // Auto-redirect prompt after 30 seconds
    setTimeout(() => {
        if (confirm('Still experiencing issues? Would you like to try face recognition again?')) {
            window.location.href = '../index.html';
        }
    }, 30000);
});