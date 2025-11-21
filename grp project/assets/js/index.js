// assets/js/index.js

import { AuthService } from './authService.js';
import { Utils } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if the camera API is available
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        document.getElementById('enableCameraButton').addEventListener('click', initCamera);
    } else {
        showCameraError();
    }
});

function initCamera() {
    const permissionsDiv = document.getElementById('cameraPermissions');
    const containerDiv = document.getElementById('cameraContainer');
    const video = document.getElementById('videoElement');

    permissionsDiv.style.display = 'none';
    containerDiv.style.display = 'block';

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                startFaceRecognitionMock(); // Start the mock process once video loads
            };
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
            showCameraError();
        });
}

function startFaceRecognitionMock() {
    const statusIndicator = document.getElementById('statusIndicator');
    const maxAttempts = 3;
    let attempts = 0;

    const interval = setInterval(() => {
        attempts++;
        statusIndicator.textContent = `Scanning... Attempt ${attempts}/${maxAttempts}`;

        if (attempts >= maxAttempts) {
            clearInterval(interval);
            // After max attempts, randomly succeed or fail
            if (Math.random() > 0.5) {
                handleLoginSuccess({ full_name: 'Biometric User' });
            } else {
                handleLoginFailure('Face not recognized after multiple attempts.');
            }
        }
    }, 3000);
}

function showCameraError() {
    const content = document.querySelector('.content');
    const container = document.getElementById('cameraContainer');
    const permissions = document.getElementById('cameraPermissions');

    // Remove video elements and show error message
    if (container) container.remove();
    if (permissions) permissions.remove();

    content.innerHTML += `
        <div class="camera-fallback">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Camera Access Denied</h3>
            <p>Please enable camera permissions in your browser settings to use face recognition.</p>
        </div>
        <div class="options">
            <a href="pages/manual-login.html" class="btn btn-primary">
                <i class="fas fa-key"></i> Use Manual Login
            </a>
        </div>
    `;
}

// Mock success flow (In a real app, this would use a FaceID service and AuthService)
async function handleLoginSuccess(mockUser) {
    const user = await AuthService.getCurrentUser();
    
    // In a real flow, the Face ID would retrieve the user's details and log them in
    if (user) {
        Utils.showMessage(`Welcome back, ${mockUser.full_name}! Redirecting...`, 'success', 'loginMessages');
        
        // Log successful attempt
        await supabase
            .from('access_history')
            .insert({ user_id: user.id, access_type: 'face_recognition', status: 'success' });
            
        setTimeout(() => {
            window.location.href = 'pages/main-menu.html';
        }, 1500);
    } else {
        // If the user is authenticated via face but no session is established (mocking error)
        handleLoginFailure('Authentication successful but user session could not be established.');
    }
}

function handleLoginFailure(message) {
    Utils.showMessage(message, 'error', 'loginMessages');
    
    // Redirect to the dedicated error screen
    setTimeout(() => {
        window.location.href = 'pages/error-screen.html?error=' + encodeURIComponent(message);
    }, 2000);
}