// assets/js/main-menu.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';
import { supabase } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Enforce Authentication
    AuthService.checkSession();
    
    // 2. Load User Data
    loadDashboardData();

    // 3. Attach Logout Handler
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
});

async function loadDashboardData() {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    // Display welcome info
    document.getElementById('userWelcome').textContent = `Welcome Back, ${user.full_name.split(' ')[0]}!`;
    document.getElementById('userRole').textContent = user.is_admin ? 'Role: Administrator' : 'Role: Standard User';

    // Show Admin Panel link if admin
    if (AuthService.isAdmin()) {
        document.getElementById('adminPanelLink').style.display = 'block';
    }

    try {
        // Fetch recent access history and stats
        const { data: history, error } = await supabase
            .from('access_history')
            .select('created_at, status, access_type, device_info')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        // 1. Update Stats
        const lastSuccessLogin = history.find(h => h.status === 'success');
        document.getElementById('lastLoginTime').textContent = lastSuccessLogin 
            ? Utils.formatDate(lastSuccessLogin.created_at) 
            : 'N/A';
        
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const failedAttempts24h = history.filter(h => 
            h.status === 'failed' && new Date(h.created_at) > oneDayAgo
        ).length;
        document.getElementById('failedAttempts').textContent = failedAttempts24h;

        // 2. Load Recent Activity List
        const activityHtml = history.map(h => `
            <div class="activity-item ${h.status}">
                <div class="activity-icon">
                    <i class="fas fa-${h.status === 'success' ? 'check' : 'times'}-circle"></i>
                </div>
                <div class="activity-info">
                    <div class="activity-title">${h.access_type.replace('_', ' ').toUpperCase()}</div>
                    <div class="activity-desc">${h.status.toUpperCase()} from ${Utils.getIconForDevice(h.device_info)}</div>
                </div>
                <div class="activity-time">${Utils.formatDate(h.created_at)}</div>
            </div>
        `).join('');

        document.getElementById('recentActivity').innerHTML = activityHtml || 
            '<div style="text-align: center; padding: 20px; color: var(--gray);">No recent activity found.</div>';

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        document.getElementById('recentActivity').innerHTML = 
            '<div style="text-align: center; padding: 20px; color: var(--danger);">Error loading activity.</div>';
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        AuthService.logout();
    }
}