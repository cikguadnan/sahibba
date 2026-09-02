window.SAHIBBA_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDzwDMcJhsHDMap6fBSsr7Az_tI2cOIggg",
  authDomain: "sahibba.firebaseapp.com",
  projectId: "sahibba",
  storageBucket: "sahibba.firebasestorage.app",
  messagingSenderId: "834942741013",
  appId: "1:834942741013:web:6df80cfebcfd6e31347c1c"
};

// Always load the latest teacher dashboard enhancement, regardless of which
// GitHub Pages deployment path serves the static site.
if (!document.querySelector('script[data-sahibba-teacher-refresh]')) {
  const script = document.createElement('script');
  script.src = 'teacher-refresh.js';
  script.defer = true;
  script.dataset.sahibbaTeacherRefresh = '1';
  document.head.appendChild(script);
}
