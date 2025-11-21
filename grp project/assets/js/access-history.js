import { AuthService } from './authService.js';
import { Utils } from './utils.js';
import { supabase } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    AuthService.checkSession();
    loadHistory();
});

async function loadHistory() {
    const user = AuthService.getCurrentUser();
    const container = document.getElementById('historyList');
    container.innerHTML = '<p style="text-align:center">Loading...</p>';

    const { data: history, error } = await supabase
        .from('access_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error || !history.length) {
        container.innerHTML = '<p style="text-align:center;color:gray">No history found.</p>';
        return;
    }

    container.innerHTML = history.map(h => `
        <div style="display:flex; justify-content:space-between; padding:15px; border-bottom:1px solid #eee; align-items:center;">
            <div>
                <div style="font-weight:bold; color: var(--dark)">${h.access_type.toUpperCase()}</div>
                <div style="font-size:0.85rem; color:var(--gray)">${Utils.getIconForDevice(h.device_info)}</div>
            </div>
            <div style="text-align:right;">
                <span class="badge ${h.status === 'success' ? 'success' : 'danger'}">${h.status}</span>
                <div style="font-size:0.75rem; margin-top:5px;">${Utils.formatDate(h.created_at)}</div>
            </div>
        </div>
    `).join('');
}

// Export Functionality
window.exportHistory = async () => {
    const user = AuthService.getCurrentUser();
    const { data: history } = await supabase.from('access_history').select('*').eq('user_id', user.id);
    
    if (!history || history.length === 0) {
        alert("No data to export.");
        return;
    }

    // Create CSV content
    const headers = ['Date', 'Type', 'Status', 'Device'];
    const rows = history.map(h => [h.created_at, h.access_type, h.status, h.device_info]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    rows.forEach(row => {
        csvContent += row.join(",") + "\n";
    });

    // Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "access_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
window.loadHistory = loadHistory;