window.SAHIBBA_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDzwDMcJhsHDMap6fBSsr7Az_tI2cOIggg",
  authDomain: "sahibba.firebaseapp.com",
  projectId: "sahibba",
  storageBucket: "sahibba.firebasestorage.app",
  messagingSenderId: "834942741013",
  appId: "1:834942741013:web:6df80cfebcfd6e31347c1c"
};

// Keep the latest teacher dashboard design attached to the base static app.
// This prevents a second GitHub Pages deployment path from reverting the UI.
if (!document.querySelector('link[data-sahibba-teacher-refresh]')) {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'teacher-refresh.css';
  style.dataset.sahibbaTeacherRefresh = '1';
  document.head.appendChild(style);
}
if (!document.querySelector('script[data-sahibba-teacher-refresh]')) {
  const script = document.createElement('script');
  script.src = 'teacher-refresh.js';
  script.defer = true;
  script.dataset.sahibbaTeacherRefresh = '1';
  document.head.appendChild(script);
}
