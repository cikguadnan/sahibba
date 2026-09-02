window.SAHIBBA_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDzwDMcJhsHDMap6fBSsr7Az_tI2cOIggg",
  authDomain: "sahibba.firebaseapp.com",
  projectId: "sahibba",
  storageBucket: "sahibba.firebasestorage.app",
  messagingSenderId: "834942741013",
  appId: "1:834942741013:web:6df80cfebcfd6e31347c1c"
};

// Attach the current teacher dashboard assets to the static app.
// Versioned URLs avoid a stale browser/CDN copy after a Pages deployment.
const SAHIBBA_UI_VERSION = '20260902-4';
if (!document.querySelector('link[data-sahibba-teacher-refresh]')) {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = `teacher-refresh.css?v=${SAHIBBA_UI_VERSION}`;
  style.dataset.sahibbaTeacherRefresh = '1';
  document.head.appendChild(style);
}
if (!document.querySelector('script[data-sahibba-teacher-refresh]')) {
  const script = document.createElement('script');
  script.src = `teacher-refresh.js?v=${SAHIBBA_UI_VERSION}`;
  script.defer = true;
  script.dataset.sahibbaTeacherRefresh = '1';
  document.head.appendChild(script);
}
