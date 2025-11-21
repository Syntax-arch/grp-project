// assets/js/main-menu.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await AuthService.getCurrentUser();

    if (!user) {
        // If no user session, force logout/redirect
        AuthService.logout();
        return;
    }

    // Set welcome and role text
    const fullName = user.user_metadata?.full_name || 'User';
    document.getElementById('userWelcome').textContent = `Welcome back, ${fullName}!`;
    
    // Check and display Admin link
    if (await AuthService.isAdmin()) {
        document.getElementById('userRole').textContent = 'Administrator';
        document.getElementById('adminPanelLink').style.display = 'block';
    } else {
        document.getElementById('userRole').textContent = 'Standard User';
    }

    // Logout button handler
    document.getElementById('logoutButton').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to log out?')) {
            AuthService.logout();
        }
    });

    // Load dynamic data
    loadUserStats(user.id);
    loadRecentActivity(user.id);
});

async function loadUserStats(userId) {
    // Mock for now, replace with real Supabase query
    document.getElementById('successfulLogins').textContent = '25';
    // In a real app:
    // const { count, error } = await supabase.from('access_history').select('*', { count: 'exact' }).eq('user_id', userId).eq('status', 'success');
}

async function loadRecentActivity(userId) {
    try {
        // Fetch last 5 access attempts from Supabase
        const { data: activity, error } = await supabase
            .from('access_history')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(5);

        if (error) throw error;
        
        const activityHtml = activity.map(item => `
            <li>
                <div class="activity-type">${item.access_type.replace('_', ' ')}</div>
                <div class="activity-time">${Utils.formatDate(item.timestamp)}</div>
                <div class="activity-status activity-${item.status}">${item.status.toUpperCase()}</div>
            </li>
        `).join('');

        document.getElementById('recentActivity').innerHTML = activityHtml || 
            '<div style="text-align: center; padding: 20px; color: var(--gray);">No recent activity found</div>';

    } catch (error) {
        console.error('Error loading recent activity:', error);
        document.getElementById('recentActivity').innerHTML = 
            '<div style="text-align: center; padding: 20px; color: var(--danger);">Error loading activity</div>';
    }
}