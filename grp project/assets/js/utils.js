// assets/js/utils.js

export class Utils {
    static showMessage(text, type = 'error', targetId = 'message') {
        const messagesDiv = document.getElementById(targetId);
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
    
    static getIconForDevice(deviceInfo) {
        if (deviceInfo.includes('Mobile') || deviceInfo.includes('Android') || deviceInfo.includes('iPhone')) {
            return '<i class="fas fa-mobile-alt"></i> Mobile';
        } else {
            return '<i class="fas fa-desktop"></i> Desktop';
        }
    }
    
    static formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}