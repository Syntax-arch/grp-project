// assets/js/utils.js

export function showMessage(text, type = 'error', containerId = 'loginMessages') {
    const messagesDiv = document.getElementById(containerId);
    if (!messagesDiv) return;

    messagesDiv.innerHTML = `
        <div class="${type === 'error' ? 'error-message' : 'success-message'}">
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i>
            ${text}
        </div>
    `;
    
    setTimeout(() => {
        messagesDiv.innerHTML = '';
    }, 5000);
}

export function isValidEmail(email) {
    const emailRegex = /^[^s@]+@[^s@]+.[^s@]+$/;
    return emailRegex.test(email);
}

// Add other utility functions here if needed