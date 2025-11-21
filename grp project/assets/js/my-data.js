// assets/js/my-data.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';
import { supabase } from './config.js';

let currentUser;

document.addEventListener('DOMContentLoaded', () => {
    AuthService.checkSession();
    loadUserData();
});

async function loadUserData() {
    currentUser = AuthService.getCurrentUser();
    if (!currentUser) return;

    document.getElementById('fullName').textContent = currentUser.full_name;
    document.getElementById('email').textContent = currentUser.email;
    document.getElementById('role').textContent = currentUser.is_admin ? 'Administrator' : 'Standard User';
}

window.editField = (field) => {
    const element = document.getElementById(field);
    const currentValue = element.textContent;
    const label = field.replace(/([A-Z])/g, ' $1').toLowerCase();
    
    const newValue = prompt(`Enter new ${label}:`, currentValue);
    
    if (newValue !== null && newValue.trim() !== '' && newValue.trim() !== currentValue) {
        element.textContent = newValue.trim();
        Utils.showMessage('Changes made locally. Click "Save Changes" to update.', 'warning', 'message');
    }
};

window.saveChanges = async () => {
    const updatedData = {
        full_name: document.getElementById('fullName').textContent,
        email: document.getElementById('email').textContent
        // You'd handle password change separately
    };
    
    // Check if anything actually changed
    if (updatedData.full_name === currentUser.full_name && updatedData.email === currentUser.email) {
        Utils.showMessage('No changes detected to save.', 'info', 'message');
        return;
    }

    try {
        const { error } = await supabase
            .from('users')
            .update(updatedData)
            .eq('id', currentUser.id);

        if (error) throw error;
        
        // Update local session
        currentUser = {...currentUser, ...updatedData};
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        Utils.showMessage('Profile updated successfully!', 'success', 'message');
    } catch (error) {
        console.error('Save error:', error);
        Utils.showMessage('Failed to save profile changes.', 'error', 'message');
    }
};

window.deleteAccount = () => {
    if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
        // In a real application, this would call a secure function to delete the user in Supabase
        Utils.showMessage('Account deletion initiated. Contacting administrator...', 'danger', 'message');
        setTimeout(() => {
            AuthService.logout(); // Redirect the user immediately
        }, 3000);
    }
};