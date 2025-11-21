// assets/js/index.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const enableCameraButton = document.getElementById('enableCameraButton');
    
    // 1. Check if the user is already logged in
    if (AuthService.getCurrentUser()) {
        Utils.showMessage('Session active. Redirecting to dashboard...', 'success', 'loginMessages');
        setTimeout(() => {
            window.location.href = 'pages/main-menu.html';
        }, 1000);
        return;
    }

    // 2. Attach Camera Handler
    if (enableCameraButton) {
        enableCameraButton.addEventListener('click', initCamera);
    }
});

/**
 * Initializes the camera stream for biometric login.
 */
function initCamera() {
    const video = document.getElementById('videoElement');
    const cameraPermissions = document.getElementById('cameraPermissions');
    const cameraContainer = document.getElementById('cameraContainer');
    const statusIndicator = document.getElementById('statusIndicator');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                cameraPermissions.style.display = 'none';
                cameraContainer.style.display = 'block';
                statusIndicator.textContent = 'Camera active. Centering face...';

                // Once the video stream is loaded, you'd start your Face Recognition logic here
                video.addEventListener('loadeddata', () => {
                    simulateFaceRecognition(video);
                });
            })
            .catch(error => {
                console.error('Camera access denied:', error);
                cameraPermissions.innerHTML = `
                    <div class="permission-icon error-message"><i class="fas fa-exclamation-triangle"></i></div>
                    <h3>Camera Access Denied</h3>
                    <p>Access was blocked. You can still use the manual login option.</p>
                `;
            });
    } else {
        Utils.showMessage('Biometric login is not supported on this device.', 'error', 'loginMessages');
    }
}

/**
 * Placeholder for actual Face Recognition logic.
 * @param {HTMLVideoElement} videoElement 
 */
function simulateFaceRecognition(videoElement) {
    const statusIndicator = document.getElementById('statusIndicator');
    
    // Simulate biometric match after a delay
    setTimeout(() => {
        statusIndicator.textContent = '🟢 Face Recognized! Logging in...';
        statusIndicator.classList.remove('ready');
        statusIndicator.classList.add('success');
        
        // --- START Biometric Login Success Simulation ---
        // In a real app, this is where you would call AuthService.login after a match
        const SIMULATED_EMAIL = 'user@company.com'; 
        const SIMULATED_PASSWORD = 'user123';
        
        AuthService.login(SIMULATED_EMAIL, SIMULATED_PASSWORD)
            .then(() => {
                setTimeout(() => {
                    window.location.href = 'pages/main-menu.html';
                }, 1000);
            })
            .catch(error => {
                // Biometric match but Auth fails (e.g., account blocked)
                Utils.showMessage('Access Denied. Account is locked.', 'error', 'loginMessages');
                statusIndicator.textContent = '❌ Access Denied.';
                window.location.href = 'pages/error-screen.html'; 
            });
        // --- END Simulation ---

    }, 3000); // 3-second delay to simulate scanning
}