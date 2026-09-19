// ===============================================
// Firebase 設定・FCM初期化
// ===============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging.js";
import { getFirestore, doc, setDoc, deleteField, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
if (!window.__debugLoggerInstalled) {
  window.__debugLoggerInstalled = true;
  const logDiv = document.createElement('div');
  logDiv.style.cssText = 'position:fixed;bottom:0;left:0;right:0;max-height:200px;overflow-y:auto;background:rgba(0,0,0,0.85);color:#0f0;font-size:12px;padding:10px;z-index:99999;font-family:monospace;white-space:pre-wrap;';
  document.body.appendChild(logDiv);
  const originalLog = console.log;
  const originalError = console.error;
  console.log = (...args) => {
    originalLog(...args);
    logDiv.innerHTML += '<div>[LOG] ' + args.join(' ') + '</div>';
    logDiv.scrollTop = logDiv.scrollHeight;
  };
  console.error = (...args) => {
    originalError(...args);
    logDiv.innerHTML += '<div style="color:red">[ERROR] ' + args.join(' ') + '</div>';
    logDiv.scrollTop = logDiv.scrollHeight;
  };
}
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

      if (!window.matchMedia('(display-mode: standalone)').matches) {
        
        console.log('ブラウザタブで開かれているためトークン保存をスキップします');
        return token;
      }

      console.log('FCMトークン取得成功:', token);
      localStorage.setItem('fcmToken', token);

      const userId = localStorage.getItem('userId');

      const schedule = JSON.parse(localStorage.getItem('notificationSchedule') || '{}');
      const db = getFirestore(app);

      await setDoc(doc(db, 'users', userId), {
        fcmToken: token,
        notificationSchedule: schedule,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('Firestoreへの保存成功');
      return token;
    }
  } catch (error) {
    console.error('FCMトークンの取得に失敗:', error);
    return null;
  }
}
/**
 * クリア日（40タスク達成した日）をFirestoreに保存する
 */
export async function saveClearDateToFirestore() {
  if (!window.matchMedia('(display-mode: standalone)').matches) {
    console.log('ブラウザタブで開かれているためクリア日保存をスキップします');
    return;
  }

  try {
    const userId = localStorage.getItem('userId');
    const db = getFirestore(app);
    const clearDate = new Date().toISOString().split('T')[0];

    await setDoc(doc(db, 'users', userId), {
      clearDate: clearDate
    }, { merge: true });

    console.log('クリア日をFirestoreに保存しました:', clearDate);
  } catch (error) {
    console.error('クリア日の保存に失敗:', error);
  }
}
/**
 * クリア日（clearDate）をFirestoreから削除する
 */
export async function deleteClearDateFromFirestore() {
  if (!window.matchMedia('(display-mode: standalone)').matches) {
    console.log('ブラウザタブで開かれているためクリア日削除をスキップします');
    return;
  }

  try {
    const userId = localStorage.getItem('userId');
    const db = getFirestore(app);

    await setDoc(doc(db, 'users', userId), {
      clearDate: deleteField()
    }, { merge: true });

    console.log('クリア日をFirestoreから削除しました');
    try {
  const checkSnap = await getDoc(doc(db, 'users', userId));
  const stillHasClearDate = checkSnap.exists() && ('clearDate' in checkSnap.data());
  if (stillHasClearDate) {
    console.error('確認結果：clearDateがまだ残っています（削除失敗）');
  } else {
    console.log('確認結果：clearDateは存在しません（削除成功）');
  }
} catch (verifyError) {
  console.error('確認処理自体が失敗しました:', verifyError);
}
  } catch (error) {
    console.error('クリア日の削除に失敗:', error);
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
