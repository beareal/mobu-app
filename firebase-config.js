// ===============================================
// Firebase 設定・FCM初期化
// ===============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCEUuLlNQ3Y9R4kF0wSb0KvsBbrs9MK5Ns",
  authDomain: "mobu-app-a08e5.firebaseapp.com",
  projectId: "mobu-app-a08e5",
  storageBucket: "mobu-app-a08e5.firebasestorage.app",
  messagingSenderId: "397938670089",
  appId: "1:397938670089:web:ea20ff1c6cb172260b56d8"
};

const VAPID_KEY = "BCC_jZTNliUNSse0L3Hl_x-NhTpkhiggBpQq0SjtBBKv6t9ji8vp3MuTHK_WFa1RuyhZjGap8b5O6XffH-wpcAQ";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * FCMトークンを取得してlocalStorageに保存する
 */
export async function initializeFCM() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      alert("【デバッグ】トークン取得成功。standalone判定へ進みます。");

      if (!window.matchMedia('(display-mode: standalone)').matches) {
        alert("【デバッグ：スキップ】ブラウザタブのため、Firestore保存を中断しました。");
        console.log('ブラウザタブで開かれているためトークン保存をスキップします');
        return token;
      }

      console.log('FCMトークン取得成功:', token);
      localStorage.setItem('fcmToken', token);

      const userId = localStorage.getItem('userId');
      alert("【デバッグ】standalone判定パス。Firestore保存開始。userId: " + userId);

      const schedule = JSON.parse(localStorage.getItem('notificationSchedule') || '{}');
      const db = getFirestore(app);

      await setDoc(doc(db, 'users', userId), {
        fcmToken: token,
        notificationSchedule: schedule,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert("【デバッグ】Firestoreへの保存が完了しました！");
      console.log('Firestoreへの保存成功');
      return token;
    }
  } catch (error) {
    alert("【デバッグ：エラー発生】initializeFCM内でエラー: " + error.message);
    console.error('FCMトークンの取得に失敗:', error);
    return null;
  }
}

/**
 * フォアグラウンド時（アプリを開いている時）にメッセージを受信する
 */
export function setupForegroundMessageHandler() {
  onMessage(messaging, (payload) => {
    console.log('フォアグラウンドでメッセージを受信:', payload);
    const { title, body, data } = payload.notification || {};
    const notificationType = payload.data?.type || 'periodic';
    const message = body || '';
  });
}
