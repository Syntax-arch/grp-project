// assets/js/admin-panel.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';
import { supabase } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Enforce Authentication AND Admin role
    if (!AuthService.isAdmin() || !AuthService.getCurrentUser()) {
        alert('Access Denied: Administrator privileges required.');
        window.location.href = 'main-menu.html';
        return;
    }
    
    loadAdminStats();
});

async function loadAdminStats() {
    try {
        // Fetch Total Users
        const { count: totalUsers, error: usersError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });
        
        if (usersError) throw usersError;
        document.getElementById('totalUsers').textContent = totalUsers;

        // Fetch Blocked/Inactive Users (Simulated by is_active = false)
        const { count: blockedUsers, error: blockedError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', false);
        
        if (blockedError) throw blockedError;
        document.getElementById('blockedUsers').textContent = blockedUsers;

        // Fetch Daily Logins (Simplified: Logins in the last 24h)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: dailyLogins, error: loginsError } = await supabase
            .from('access_history')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'success')
            .gte('created_at', twentyFourHoursAgo);
            
        if (loginsError) throw loginsError;
        document.getElementById('dailyLogins').textContent = dailyLogins;
        
        // Fetch Failed Biometric Scans (Simulated by access_type = biometric_login and status = failed)
        const { count: failedScans, error: scansError } = await supabase
            .from('access_history')
            .select('*', { count: 'exact', head: true })
            .eq('access_type', 'biometric_login')
            .eq('status', 'failed');

        if (scansError) throw scansError;
        document.getElementById('failedScans').textContent = failedScans;


    } catch (error) {
        console.error('Error loading admin stats:', error);
        Utils.showMessage('Failed to load admin dashboard data.', 'error', 'message');
    }
}

// Global functions exposed for the HTML onclick handlers
window.manageUsers = () => Utils.showMessage('Loading User Management interface...', 'success', 'message');
window.viewSystemLogs = () => Utils.showMessage('Fetching system-wide access logs...', 'success', 'message');
window.accessReports = () => Utils.showMessage('Generating security access reports...', 'success', 'message');
window.securitySettings = () => Utils.showMessage('Applying global security policy settings...', 'success', 'message');