// assets/js/admin-panel.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const isAdmin = await AuthService.isAdmin();
    
    if (!isAdmin) {
        document.getElementById('adminContent').style.display = 'none';
        document.getElementById('accessDenied').style.display = 'block';
        
        // Log access attempt failure
        const user = await AuthService.getCurrentUser();
        if (user) {
            await supabase.from('access_history').insert({
                user_id: user.id, 
                access_type: 'admin_panel', 
                status: 'denied', 
                reason: 'non-admin access attempt'
            });
        }
        return;
    }

    // Load dynamic data for admins
    loadAdminStats();

    // Attach event listeners for admin actions (mocked actions)
    document.getElementById('manageUsersButton').addEventListener('click', () => manageUsers());
    document.getElementById('viewLogsButton').addEventListener('click', () => viewSystemLogs());
    // ... attach other listeners
});

async function loadAdminStats() {
    // Mocking real data retrieval for a professional-looking dashboard
    document.getElementById('totalUsers').textContent = '147';
    document.getElementById('activeSessions').textContent = '12';
    document.getElementById('last24hLogins').textContent = '58';
    
    // In a real app, use Supabase queries for counts:
    /*
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact' });
    document.getElementById('totalUsers').textContent = totalUsers;
    */
}

function manageUsers() {
    Utils.showMessage('User Management panel would open here', 'success');
}

function viewSystemLogs() {
    Utils.showMessage('System Logs panel would open here', 'success');
}