import { AuthService } from './authService.js';
import { Utils } from './utils.js';
import { supabase } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!AuthService.isAdmin()) {
        window.location.href = 'main-menu.html';
        return;
    }
    loadStats();
});

async function loadStats() {
    const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
    document.getElementById('totalUsers').textContent = users || 0;
    
    const { count: blocked } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', false);
    document.getElementById('blockedUsers').textContent = blocked || 0;
}

// Generic Modal Creator
function openModal(title, htmlContent) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'activeModal';
    modal.innerHTML = `
        <div class="modal-card">
            <button class="close-modal" onclick="document.getElementById('activeModal').remove()">&times;</button>
            <h3 style="margin-bottom:15px;color:var(--primary)">${title}</h3>
            <div>${htmlContent}</div>
        </div>`;
    document.body.appendChild(modal);
}

// 1. User Management
window.manageUsers = async () => {
    openModal('User Management', '<p>Loading users...</p>');
    
    const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    
    let html = `<table class="data-table"><thead><tr><th>Name</th><th>Status</th><th>Action</th></tr></thead><tbody>`;
    users.forEach(u => {
        html += `<tr>
            <td>${u.full_name}<br><small style="color:gray">${u.email}</small></td>
            <td><span class="badge ${u.is_active ? 'success' : 'danger'}">${u.is_active ? 'Active' : 'Blocked'}</span></td>
            <td><button class="btn-sm" style="padding:5px" onclick="toggleStatus('${u.id}', ${u.is_active})">
                ${u.is_active ? 'Block' : 'Unblock'}
            </button></td>
        </tr>`;
    });
    html += `</tbody></table>`;
    
    // Update modal content
    const modalBody = document.querySelector('#activeModal .modal-card > div');
    if(modalBody) modalBody.innerHTML = html;
};

window.toggleStatus = async (id, currentStatus) => {
    if(!confirm(`Change user status?`)) return;
    await supabase.from('users').update({ is_active: !currentStatus }).eq('id', id);
    document.getElementById('activeModal').remove(); // Close and reload
    window.manageUsers(); 
};

// 2. System Logs
window.viewSystemLogs = async () => {
    openModal('System Logs', '<p>Loading logs...</p>');
    const { data: logs } = await supabase.from('access_history').select('*').order('created_at', { ascending: false }).limit(50);
    
    let html = `<ul style="list-style:none;">`;
    logs.forEach(log => {
        html += `<li style="border-bottom:1px solid #eee; padding:8px 0;">
            <strong>${log.access_type}</strong> - ${log.status}
            <div style="font-size:0.8rem;color:gray">${Utils.formatDate(log.created_at)} | ${log.location || 'Unknown'}</div>
        </li>`;
    });
    html += `</ul>`;
    
    const modalBody = document.querySelector('#activeModal .modal-card > div');
    if(modalBody) modalBody.innerHTML = html;
};

window.accessReports = () => alert("Report generation feature coming in v3.1");
window.securitySettings = () => alert("Global security settings coming in v3.1");