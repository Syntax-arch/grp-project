import { AuthService } from './authService.js';
import { Utils } from './utils.js';
import { supabase } from './config.js';

let labeledDescriptors = [];
let faceMatcher = null;
let videoStream = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. ログイン済みならリダイレクト
    if (AuthService.getCurrentUser()) {
        window.location.href = 'pages/main-menu.html';
        return;
    }

    // 2. AIモデルのロード開始
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('./assets/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('./assets/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('./assets/models')
        ]);
        
        // DBから全ユーザーの顔データを取得してマッチャーを準備
        await loadLabeledImages();
        
        document.getElementById('loadingModels').style.display = 'none';
        document.getElementById('cameraPermissions').style.display = 'block';
        
        document.getElementById('enableCameraButton').addEventListener('click', startCamera);
    } catch (error) {
        console.error("Error loading models:", error);
        Utils.showMessage('Failed to load AI models. Check console.', 'error', 'loginMessages');
    }
});

async function loadLabeledImages() {
    // DBから顔データを持つユーザーのみ取得
    const { data: users, error } = await supabase
        .from('users')
        .select('email, face_descriptor')
        .not('face_descriptor', 'is', null);

    if (error || !users) return;

    labeledDescriptors = users.map(user => {
        // JSON配列をFloat32Arrayに変換
        const descriptor = new Float32Array(Object.values(user.face_descriptor));
        return new faceapi.LabeledFaceDescriptors(user.email, [descriptor]);
    });

    if (labeledDescriptors.length > 0) {
        faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6); // 閾値 0.6
    }
}

async function startCamera() {
    const video = document.getElementById('videoElement');
    const container = document.getElementById('cameraContainer');
    const statusIndicator = document.getElementById('statusIndicator');

    try {
        // モバイル対応: 背面カメラではなく前面カメラ(user)を優先
        videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        
        video.srcObject = videoStream;
        document.getElementById('cameraPermissions').style.display = 'none';
        container.style.display = 'block';

        // 映像再生開始イベントで認識ループを開始
        video.addEventListener('play', () => {
            const canvas = document.getElementById('overlayCanvas');
            const displaySize = { width: video.clientWidth, height: video.clientHeight };
            faceapi.matchDimensions(canvas, displaySize);

            setInterval(async () => {
                // 顔検出
                const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptors();

                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                
                // キャンバスをクリアして描画
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                
                if (!faceMatcher) {
                    statusIndicator.textContent = "No registered faces in DB.";
                    return;
                }

                if (resizedDetections.length > 0) {
                    const result = faceMatcher.findBestMatch(resizedDetections[0].descriptor);
                    
                    if (result.label !== 'unknown') {
                        // 認証成功！
                        statusIndicator.textContent = `Verified: ${result.label}`;
                        statusIndicator.style.color = 'var(--success)';
                        faceapi.draw.drawDetections(canvas, resizedDetections);
                        
                        // ログイン処理へ (パスワードレスログインとして扱うため、サーバー側で特別な処理が必要だが
                        // ここでは簡易的にAuthServiceでユーザー情報を取得してログインとする)
                        performBiometricLogin(result.label);
                    } else {
                        statusIndicator.textContent = "Face not recognized";
                        statusIndicator.style.color = 'var(--danger)';
                        faceapi.draw.drawDetections(canvas, resizedDetections);
                    }
                } else {
                    statusIndicator.textContent = "Scanning...";
                    statusIndicator.style.color = 'white';
                }
            }, 200); // 200msごとに判定
        });

    } catch (err) {
        console.error(err);
        Utils.showMessage('Camera access denied or not supported.', 'error', 'loginMessages');
    }
}

async function performBiometricLogin(email) {
    // カメラを停止
    if(videoStream) videoStream.getTracks().forEach(track => track.stop());
    
    // ユーザー情報を取得してセッション保存 (パスワードなしでログイン)
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        
        // ログ記録
        await supabase.from('access_history').insert({
            user_id: user.id, access_type: 'biometric_login', status: 'success',
            device_info: navigator.userAgent, location: 'Face Login'
        });

        window.location.href = 'pages/main-menu.html';
    }
}