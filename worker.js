// worker.js
// 環境変数（Cloudflare Dashboardで設定）:
// SERVICE_ACCOUNT_EMAIL : サービスアカウントのメールアドレス
// PRIVATE_KEY           : サービスアカウントの秘密鍵
// PROJECT_ID            : mobu-app-a08e5
// FIRESTORE_COLLECTION  : users

export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      if (url.pathname === '/favicon.ico') {
        return new Response(null, { status: 204 });
      }
      await sendNotifications(env);
      return new Response("sent ok");
    }
  };
  
  async function generateJWT(env) {
    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const claim = {
      iss: env.SERVICE_ACCOUNT_EMAIL,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };
    const encode = (obj) =>
      btoa(JSON.stringify(obj))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    const unsignedToken = `${encode(header)}.${encode(claim)}`;
    const pemKey = env.PRIVATE_KEY.replace(/\\n/g, "\n");
    const keyData = pemKey
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/\s/g, "");
    const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(unsignedToken)
    );
    const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return `${unsignedToken}.${sigBase64}`;
  }
  
  async function getAccessToken(env) {
    const jwt = await generateJWT(env);
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });
    const data = await res.json();
    return data.access_token;
  }
  
  async function getTokensFromFirestore(env, accessToken) {
    const url = `https://firestore.googleapis.com/v1/projects/${env.PROJECT_ID}/databases/(default)/documents/${env.FIRESTORE_COLLECTION}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents
      .map((doc) => doc.fields?.fcmToken?.stringValue)
      .filter(Boolean);
  }
  
  async function sendFCM(env, accessToken, token, title, body) {
    const url = `https://fcm.googleapis.com/v1/projects/${env.PROJECT_ID}/messages:send`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body },
            android: { priority: "high" },
            webpush: {
              headers: {
                TTL: "3600",
              },
              notification: {
                tag: tag,
              },
              data: {
                notificationId: notificationId,
              },
            },
          },
        }),
    });
    return res.ok;
  }
  
  async function sendNotifications(env) {
    const hour = (new Date().getUTCHours() + 9) % 24;
    let title, body;
    if (hour >= 7 && hour < 10) {
      title = "おはよう！";
      body = "今日のタスクを確認しよう";
    } else if (hour >= 12 && hour < 15) {
      title = "お昼だよ！";
      body = "午後のタスクをチェックしよう";
    } else {
      title = "おやすみ前に";
      body = "今日のタスクを振り返ろう";
    }
    const accessToken = await getAccessToken(env);
    const tokens = await getTokensFromFirestore(env, accessToken);
    for (const token of tokens) {
      await sendFCM(env, accessToken, token, title, body);
    }
  }