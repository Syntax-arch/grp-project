// assets/js/settings.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    AuthService.checkSession();
    loadSettings();
});

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('userSettings')) || {
        biometricLock: true,
        twoFactor: false,
        loginAlerts: true
    };
    
    document.getElementById('biometricLock').checked = settings.biometricLock;
    document.getElementById('twoFactor').checked = settings.twoFactor;
    document.getElementById('loginAlerts').checked = settings.loginAlerts;
}

window.saveSettings = () => {
    const settings = {
        biometricLock: document.getElementById('biometricLock').checked,
        twoFactor: document.getElementById('twoFactor').checked,
        loginAlerts: document.getElementById('loginAlerts').checked,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('userSettings', JSON.stringify(settings));
    Utils.showMessage('Settings saved successfully!', 'success', 'message');
};

window.resetSettings = () => {
    if (confirm('Reset all settings to default values?')) {
        localStorage.removeItem('userSettings');
        loadSettings(); // Re-load to default values
        Utils.showMessage('Settings reset to default values', 'success', 'message');
    }
};

window.registerFace = () => {
    Utils.showMessage('Biometric registration process started. Please look at the camera.', 'success', 'message');
    // Actual camera logic would go here
};