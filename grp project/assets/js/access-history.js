// assets/js/access-history.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';
import { supabase } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    AuthService.checkSession();
    loadHistory();
    // Attach event listeners for filter changes
    document.getElementById('filterType').addEventListener('change', loadHistory);
    document.getElementById('filterStatus').addEventListener('change', loadHistory);
});

async function loadHistory() {
    const user = AuthService.getCurrentUser();
    const historyList = document.getElementById('historyList');
    
    if (!user) {
        historyList.innerHTML = '<div style="text-align: center; padding: 20px;">User not found.</div>';
        return;
    }
    
    historyList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--gray);"><i class="fas fa-spinner fa-spin"></i> Loading history...</div>';

    const filterType = document.getElementById('filterType').value;
    const filterStatus = document.getElementById('filterStatus').value;

    let query = supabase
        .from('access_history')
        .select('created_at, status, access_type, device_info, message')
        .eq('user_id', user.id);
        
    if (filterType !== 'all') {
        query = query.eq('access_type', filterType);
    }
    if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
    }

    try {
        const { data: history, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        const historyHtml = history.map(h => `
            <div class="activity-item ${h.status}">
                <div class="activity-icon">
                    <i class="fas fa-${h.status === 'success' ? 'check' : 'times'}-circle"></i>
                </div>
                <div class="activity-info">
                    <div class="activity-title">${h.access_type.replace('_', ' ').toUpperCase()} - ${h.status.toUpperCase()}</div>
                    <div class="activity-desc">${Utils.getIconForDevice(h.device_info)} - ${h.message || 'N/A'}</div>
                </div>
                <div class="activity-time">${Utils.formatDate(h.created_at)}</div>
            </div>
        `).join('');

        historyList.innerHTML = historyHtml || '<div style="text-align: center; padding: 20px; color: var(--gray);">No history found with these filters.</div>';

    } catch (error) {
        console.error('Error loading history:', error);
        Utils.showMessage('Failed to load history. Please check console.', 'error');
        historyList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--danger);">Error loading history.</div>';
    }
}

window.loadHistory = loadHistory; // Expose to global scope for button onclick
window.exportHistory = () => { 
    Utils.showMessage('Export feature coming soon!', 'success', 'message');
};