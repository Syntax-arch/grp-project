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

export function isStrongPassword(password) {
    // At least 8 characters, with uppercase, lowercase, number, and special character
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
}

// assets/js/utils.js
export const Utils = {
    showMessage(text, type = 'error', containerId = 'message') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="${type === 'error' ? 'error-message' : 'success-message'}">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i> ${text}
            </div>`;
            
        setTimeout(() => container.innerHTML = '', 5000);
    },

    formatDate(isoString) {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString();
    },

    getIconForDevice(userAgent) {
        if (!userAgent) return '<i class="fas fa-desktop"></i> Desktop';
        if (/mobile/i.test(userAgent)) return '<i class="fas fa-mobile-alt"></i> Mobile';
        if (/tablet/i.test(userAgent)) return '<i class="fas fa-tablet-alt"></i> Tablet';
        return '<i class="fas fa-desktop"></i> Desktop';
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
};