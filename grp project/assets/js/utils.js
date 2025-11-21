// assets/js/utils.js

export function showMessage(text, type = 'error', messageContainerId = 'message') {
    const messagesDiv = document.getElementById(messageContainerId);
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isStrongPassword(password) {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
}