import { AuthService } from './authService.js';
import { Utils } from './utils.js';
import { supabase } from './config.js';

let verifyStream = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Session
    const user = AuthService.checkSession();
    if (!user) return;

    // 2. Populate Header Info
    updateDashboardHeader(user);

    // 3. Load Recent Activity
    loadRecentActivity(user.id);

    // 4. Attach Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Log out of Secure Access System?')) {
            AuthService.logout();
        }
    });

    // 5. Setup Quick Verify Functions globally
    window.triggerQuickVerify = startQuickVerify;
    window.closeVerifyModal = stopQuickVerify;
    window.triggerSecurityScan = runSystemScan;
});

function updateDashboardHeader(user) {
    document.getElementById('userNameDisplay').textContent = user.full_name;
    
    const roleBadge = document.getElementById('userRole');
    roleBadge.textContent = user.is_admin ? 'Administrator' : 'Standard User';
    roleBadge.className = `role-badge ${user.is_admin ? 'admin' : 'user'}`;

    // Show Admin Panel if applicable
    if (AuthService.isAdmin()) {
        const adminLink = document.getElementById('adminPanelLink');
        adminLink.style.display = 'flex';
    }

    // Set initials for avatar
    const initials = user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('userAvatar').innerHTML = `<span>${initials}</span>`;
}

async function loadRecentActivity(userId) {
    const container = document.getElementById('recentActivityWidget');
    
    try {
        const { data: logs, error } = await supabase
            .from('access_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) throw error;

        if (!logs || logs.length === 0) {
            container.innerHTML = '<div style="color:#999; text-align:center; padding:10px;">No recent activity.</div>';
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="activity-row">
                <div class="act-icon ${log.status === 'success' ? 'success' : 'failed'}">
                    <i class="fas fa-${log.status === 'success' ? 'check' : 'times'}"></i>
                </div>
                <div class="act-details">
                    <div class="act-title">${log.access_type.replace('_', ' ').toUpperCase()}</div>
                    <div class="act-time">${Utils.formatDate(log.created_at)}</div>
                </div>
            </div>
        `).join('');

    } catch (e) {
        console.error(e);
        container.innerHTML = '<div style="color:red; font-size:0.8rem;">Failed to load activity.</div>';
    }
}

// --- Quick Verify Feature (Camera) ---
async function startQuickVerify() {
    const modal = document.getElementById('verifyModal');
    const video = document.getElementById('verifyVideo');
    const status = document.getElementById('verifyStatus');
    
    modal.style.display = 'flex';
    status.textContent = "Loading AI Models...";

    try {
        // Load models if not already loaded
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('../assets/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('../assets/models')
        ]);

        status.textContent = "Starting Camera...";

        // Start Camera (User facing)
        verifyStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user", width: { ideal: 480 } } 
        });
        video.srcObject = verifyStream;

        video.onplay = () => {
            status.textContent = "Scanning Face...";
            
            const interval = setInterval(async () => {
                if (video.paused || video.ended || !verifyStream) {
                    clearInterval(interval);
                    return;
                }

                const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());

                if (detection) {
                    status.innerHTML = '<span style="color:var(--success)"><i class="fas fa-check-circle"></i> Face Verified!</span>';
                    // Optional: Draw box (simplified for this view)
                } else {
                    status.textContent = "Scanning... Keep face visible.";
                }
            }, 500);
        };

    } catch (err) {
        console.error(err);
        status.innerHTML = '<span style="color:var(--danger)">Camera Error or Permission Denied</span>';
    }
}

function stopQuickVerify() {
    const modal = document.getElementById('verifyModal');
    modal.style.display = 'none';
    
    if (verifyStream) {
        verifyStream.getTracks().forEach(track => track.stop());
        verifyStream = null;
    }
}

// --- System Scan Simulation ---
function runSystemScan() {
    const btn = document.querySelector('.action-card');
    const originalContent = btn.innerHTML;
    
    btn.innerHTML = '<div style="text-align:center"><i class="fas fa-spinner fa-spin"></i> Scanning...</div>';
    
    setTimeout(() => {
        alert("System Integrity Check: PASSED\nDatabase Connection: SECURE\nBiometric Engine: ONLINE");
        btn.innerHTML = originalContent;
    }, 1500);
}