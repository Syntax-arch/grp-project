// assets/js/settings.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await AuthService.getCurrentUser();
    if (!user) {
        AuthService.logout();
        return;
    }
    
    // Attach event listeners
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);
    document.getElementById('registerFaceBtn').addEventListener('click', registerFace);

    loadSettings();
});

function loadSettings() {
    // Load settings from localStorage (mocking a DB fetch)
    const settingsStr = localStorage.getItem('userSettings');
    let settings;
    if (settingsStr) {
        settings = JSON.parse(settingsStr);
    } else {
        // Default settings
        settings = {
            twoFactor: false,
            loginAlerts: true,
            failedAttemptAlerts: true
        };
    }

    document.getElementById('twoFactor').checked = settings.twoFactor;
    document.getElementById('loginAlerts').checked = settings.loginAlerts;
    document.getElementById('failedAttemptAlerts').checked = settings.failedAttemptAlerts;
}

function saveSettings() {
    const settings = {
        twoFactor: document.getElementById('twoFactor').checked,
        loginAlerts: document.getElementById('loginAlerts').checked,
        failedAttemptAlerts: document.getElementById('failedAttemptAlerts').checked,
        savedAt: new Date().toISOString()
    };
    
    // In a real app, this would be saved to a 'user_settings' table in Supabase
    localStorage.setItem('userSettings', JSON.stringify(settings));
    Utils.showMessage('Settings saved successfully!', 'success');
}

function resetSettings() {
    if (confirm('Reset all settings to default values?')) {
        localStorage.removeItem('userSettings');
        
        // Update UI to reflect defaults
        document.getElementById('twoFactor').checked = false;
        document.getElementById('loginAlerts').checked = true;
        document.getElementById('failedAttemptAlerts').checked = true;
        
        Utils.showMessage('Settings reset to default values', 'success');
    }
}

function registerFace() {
    Utils.showMessage('Face registration feature would open camera here (Mock functionality)', 'success');
}