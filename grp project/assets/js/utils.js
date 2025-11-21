// assets/js/utils.js

/**
 * ⚙️ Utils Module: Contains all reusable helper functions.
 */
export const Utils = {

    /**
     * Centralized function for displaying success/error messages.
     */
    showMessage: (text, type = 'error', messageId = 'message') => {
        const messageDiv = document.getElementById(messageId);
        if (!messageDiv) {
            console.warn(`Message div with ID '${messageId}' not found.`);
            return;
        }

        const icon = type === 'error' ? 'exclamation-triangle' : 'check-circle';
        const className = type === 'error' ? 'error-message' : 'success-message';

        messageDiv.innerHTML = `
            <div class="${className}">
                <i class="fas fa-${icon}"></i>
                ${text}
            </div>
        `;

        // Clear the message after 5 seconds
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 5000);
    },

    /**
     * Date formatter (logic extracted from access-history.html).
     */
    formatDate: (dateString) => {
        // ... (Your original formatDate logic goes here, or a simplified version)
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    /**
     * Password strength validation (logic extracted from registration.html).
     */
    isStrongPassword: (password) => {
        // At least 8 chars, with uppercase, lowercase, number, and special character
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongRegex.test(password);
    },
    
    isValidEmail: (email) => {
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        return emailRegex.test(email);
    }
};