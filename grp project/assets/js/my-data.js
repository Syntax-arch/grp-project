// assets/js/my-data.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
        AuthService.logout();
        return;
    }

    loadUserData(currentUser);
    
    // Attach event listeners
    document.getElementById('saveChangesBtn').addEventListener('click', saveChanges);
    document.getElementById('deleteAccountBtn').addEventListener('click', deleteAccount);
    
    // Attach listeners to all 'Edit' buttons
    document.querySelectorAll('.btn-secondary.btn-sm').forEach(button => {
        button.addEventListener('click', (e) => editField(e.target.dataset.field));
    });
});

async function loadUserData(user) {
    document.getElementById('fullName').textContent = user.user_metadata?.full_name || 'N/A';
    document.getElementById('emailAddress').textContent = user.email || 'N/A';
    document.getElementById('memberSince').textContent = Utils.formatDate(user.created_at);

    // Fetch last access history to get last login time (Mocked for now)
    document.getElementById('lastLogin').textContent = 'Just Now (Mock)';
}

function editField(field) {
    const targetElement = document.getElementById(field);
    const currentValue = targetElement.textContent;
    
    let newValue = prompt(`Enter new ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}:`, currentValue);
    
    if (newValue !== null && newValue.trim() !== '') {
        // Simple client-side update
        targetElement.textContent = newValue.trim();
        Utils.showMessage('Changes made locally. Click "Save Changes" to confirm.', 'success');
        
        // In a real app: update the global currentUser object and prepare for Supabase update
    }
}

async function saveChanges() {
    // Collect updated data (e.g., from the elements)
    const newFullName = document.getElementById('fullName').textContent;
    const newEmail = document.getElementById('emailAddress').textContent;
    
    // In a real app, use the secure Supabase update method:
    // const { data, error } = await supabase.auth.updateUser({ email: newEmail, data: { full_name: newFullName } });

    Utils.showMessage('Profile updated successfully!', 'success');
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('This will permanently remove all your data. Are you absolutely sure?')) {
            // In a real app, you would call a secure function/endpoint to handle deletion
            // await supabase.rpc('delete_user_account'); // Example custom function
            
            Utils.showMessage('Account deletion requested. Admin approval needed.', 'error');
            AuthService.logout(); // Log out the user immediately
        }
    }
}