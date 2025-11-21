// assets/js/support.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await AuthService.getCurrentUser();
    if (!user) {
        AuthService.logout(); // Ensure session exists before submission
        return;
    }

    const supportForm = document.getElementById('supportForm');
    if (supportForm) {
        supportForm.addEventListener('submit', (e) => submitTicket(e, user));
    }
});

async function submitTicket(e, user) {
    e.preventDefault();
    
    const issueType = document.getElementById('issueType').value;
    const issueDescription = document.getElementById('issueDescription').value.trim();
    const urgency = document.getElementById('urgency').value;
    const submitBtn = document.getElementById('submitTicketBtn');

    if (!issueType || !issueDescription) {
        Utils.showMessage('Please select an issue type and provide a description.', 'error');
        return;
    }

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    try {
        // This assumes you have a 'support_tickets' table in Supabase
        const { error } = await supabase
            .from('support_tickets')
            .insert({
                user_id: user.id,
                user_email: user.email,
                issue_type: issueType,
                description: issueDescription,
                urgency: urgency,
                status: 'open'
            })
            .select()
            .single();

        if (error) throw error;

        Utils.showMessage('Support ticket submitted successfully! We will contact you within 24 hours.', 'success');
        
        // Clear form
        document.getElementById('issueType').value = '';
        document.getElementById('issueDescription').value = '';
        document.getElementById('urgency').value = 'medium';

    } catch (error) {
        console.error('Error submitting ticket:', error);
        Utils.showMessage('Error submitting support ticket. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Support Ticket';
        submitBtn.disabled = false;
    }
}