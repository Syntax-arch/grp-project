// assets/js/support.js

import { supabase } from './config.js';
import { Utils } from './utils.js';
import { AuthService } from './authService.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check session to pre-fill user info if possible
    AuthService.checkSession(false);
    document.getElementById('supportForm').addEventListener('submit', handleSubmitTicket);
});

async function handleSubmitTicket(e) {
    e.preventDefault();
    
    const user = AuthService.getCurrentUser();
    const issueType = document.getElementById('issueType').value;
    const urgency = document.getElementById('urgency').value;
    const description = document.getElementById('issueDescription').value.trim();
    const submitBtn = document.getElementById('submitBtn');

    if (!issueType || !description) {
        Utils.showMessage('Please fill in the issue type and description.', 'error');
        return;
    }

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    try {
        const { error } = await supabase
            .from('support_tickets')
            .insert([{
                user_id: user ? user.id : null,
                issue_type: issueType,
                urgency: urgency,
                description: description,
                status: 'open',
                device_info: navigator.userAgent
            }])
            .select();

        if (error) throw error;

        Utils.showMessage('Support ticket submitted successfully! We will contact you within 24 hours.', 'success');
        
        // Clear form
        document.getElementById('supportForm').reset();

    } catch (error) {
        console.error('Error submitting ticket:', error);
        Utils.showMessage('Error submitting support ticket. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Support Ticket';
        submitBtn.disabled = false;
    }
}