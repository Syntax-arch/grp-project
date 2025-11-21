import { AuthService } from './authService.js';
import { Utils } from './utils.js';
import { supabase } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    AuthService.checkSession();
    // AIモデルのロード (設定画面でも必要)
    loadModels();
});

async function loadModels() {
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('../assets/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('../assets/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('../assets/models')
    ]);
    console.log("Models loaded for registration");
}

// HTML側のボタンに onclick="registerFace()" が設定されている前提
window.registerFace = async () => {
    // モーダルUIの代わりに簡単なオーバーレイを作成
    const overlay = document.createElement('div');
    overlay.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;";
    overlay.innerHTML = `
        <h2 style="color:white;margin-bottom:20px;">Register Face ID</h2>
        <video id="regVideo" autoplay muted playsinline width="320" height="240" style="border:2px solid var(--primary);border-radius:10px;"></video>
        <div id="regStatus" style="color:white;margin-top:10px;">Scanning... Hold still.</div>
        <button id="closeReg" class="btn btn-danger" style="margin-top:20px;">Cancel</button>
    `;
    document.body.appendChild(overlay);

    const video = document.getElementById('regVideo');
    const status = document.getElementById('regStatus');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        video.srcObject = stream;

        let scanCount = 0;
        const scanInterval = setInterval(async () => {
            const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detections) {
                scanCount++;
                status.textContent = `Scanning... ${scanCount * 20}%`;

                if (scanCount >= 5) { // 5回連続検出で登録
                    clearInterval(scanInterval);
                    stream.getTracks().forEach(track => track.stop());
                    
                    // 特徴量をDBに保存
                    await saveFaceDescriptor(detections.descriptor);
                    
                    overlay.innerHTML = `
                        <i class="fas fa-check-circle fa-4x" style="color:var(--success);"></i>
                        <h2 style="color:white;margin-top:20px;">Success!</h2>
                        <p style="color:#ccc;">Your face data has been updated.</p>
                        <button onclick="location.reload()" class="btn btn-primary" style="margin-top:20px;">Close</button>
                    `;
                }
            } else {
                status.textContent = "No face detected. Please look at the camera.";
            }
        }, 500);

        document.getElementById('closeReg').onclick = () => {
            clearInterval(scanInterval);
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(overlay);
        };

    } catch (err) {
        console.error(err);
        alert("Camera error. Please enable camera permissions.");
        document.body.removeChild(overlay);
    }
};

async function saveFaceDescriptor(descriptor) {
    const user = AuthService.getCurrentUser();
    // Float32Arrayを通常の配列に変換して保存
    const descriptorArray = Array.from(descriptor);
    
    const { error } = await supabase
        .from('users')
        .update({ face_descriptor: descriptorArray })
        .eq('id', user.id);

    if (error) {
        console.error(error);
        Utils.showMessage('Database Error: Could not save face data.', 'error', 'message');
    } else {
        Utils.showMessage('Face ID registered successfully!', 'success', 'message');
    }
}