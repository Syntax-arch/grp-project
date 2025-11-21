// assets/js/authService.js

import { supabase } from './config.js'; 
import { Utils } from './utils.js';

export class AuthService {
    
    static async login(email, password) {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('is_active', true)
                .single();

            if (error && error.code !== 'PGRST116') throw new Error('Database error. Check console.');
            if (!user) throw new Error('Invalid email or password');
            
            if (user.password_hash !== password) {
                await AuthService.logAccessAttempt(user.id, 'manual_login', 'failed', 'Invalid password attempt.');
                throw new Error('Invalid email or password');
            }

            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('isAuthenticated', 'true');
            
            await AuthService.logAccessAttempt(user.id, 'manual_login', 'success', 'User successfully logged in.');

            return user;

        } catch (error) {
            if (error.message === 'Invalid email or password') {
                 AuthService.logAccessAttempt(null, 'manual_login', 'failed', 'Non-existent user attempt.');
            }
            throw error;
        }
    }

    static async checkSession(shouldRedirect = true) {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        if (isAuthenticated) {
            return true;
        } else if (shouldRedirect) {
            window.location.href = '../index.html'; 
        }
        return false;
    }
    
    static getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    static logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '../index.html'; 
    }

    static isAdmin() {
        const user = AuthService.getCurrentUser();
        return user ? user.is_admin : false;
    }

    static async logAccessAttempt(userId, accessType, status, message) {
        try {
            await supabase
                .from('access_history')
                .insert([{
                    user_id: userId,
                    access_type: accessType,
                    status: status,
                    device_info: navigator.userAgent,
                    location: 'Web Application',
                    message: message 
                }]);
        } catch (e) {
            console.error('Error logging access attempt:', e);
        }
    }
}