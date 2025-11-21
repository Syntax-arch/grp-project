// assets/js/access-history.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await AuthService.getCurrentUser();
    if (!user) {
        AuthService.logout(); // Redirect if not authenticated
        return;
    }

    document.getElementById('applyFiltersBtn').addEventListener('click', () => loadAccessHistory(user.id));
    document.getElementById('exportHistoryBtn').addEventListener('click', () => Utils.showMessage('Export feature coming soon!', 'success'));
    
    // Initial load
    loadAccessHistory(user.id);
});

async function loadAccessHistory(userId) {
    const historyList = document.getElementById('historyList');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const filterType = document.getElementById('filterType').value;
    const filterStatus = document.getElementById('filterStatus').value;

    loadingIndicator.style.display = 'block';
    historyList.innerHTML = '';
    
    try {
        let query = supabase
            .from('access_history')
            .select('timestamp, access_type, status, device_info, location')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false });

        if (filterType !== 'all') {
            query = query.eq('access_type', filterType);
        }
        if (filterStatus !== 'all') {
            query = query.eq('status', filterStatus);
        }

        const { data: history, error } = await query;

        if (error) throw error;
        
        if (history.length === 0) {
            historyList.innerHTML = '<li style="text-align: center; color: var(--gray);">No history found with these filters.</li>';
            return;
        }

        const historyHtml = history.map(item => `
            <li>
                <div class="activity-type">
                    ${item.access_type.replace(/_/g, ' ').toUpperCase()}
                    <span class="activity-status activity-${item.status}">${item.status.toUpperCase()}</span>
                </div>
                <div class="activity-time">${Utils.formatDate(item.timestamp)}</div>
                <div class="activity-details">
                    <i class="fas fa-map-marker-alt"></i> ${item.location || 'Unknown Location'}
                    <i class="fas fa-desktop"></i> ${getDeviceInfo(item.device_info)}
                </div>
            </li>
        `).join('');

        historyList.innerHTML = historyHtml;

    } catch (error) {
        Utils.showMessage('Failed to load history: ' + error.message, 'error');
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

function getDeviceInfo(deviceInfo) {
    // Logic extracted from admin-panel/main-menu
    if (!deviceInfo) return 'Unknown Device';
    if (deviceInfo.includes('Mobile') || deviceInfo.includes('Android') || deviceInfo.includes('iPhone')) {
        return '📱 Mobile';
    } else {
        return '💻 Desktop';
    }
}