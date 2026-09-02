# Sahibba Classroom

Permainan kata Bahasa Melayu untuk kelas. Murid menyertai sesi tanpa akaun, dipadankan secara rawak dan bermain secara bergilir. Guru menggunakan Google Sign-In untuk membuka pusat kawalan, menyemak cabaran perkataan, melihat arkib permainan dan memantau semua perlawanan secara langsung.

## Versi yang digunakan di GitHub Pages

Aplikasi kelas yang sedang diterbitkan ialah versi statik di akar repositori:

- `index.html` — aplikasi utama murid dan guru
- `site.js` — logik permainan, Firebase dan kemas kini masa nyata
- `dashboard.css` + `teacher-refresh.css` — antaramuka dan penambahbaikan dashboard guru
- `live.html`, `live.js`, `live.css` — paparan kelas/projektor secara langsung
- `kamus-47000.js` — kamus asas permainan

Folder `app/` mengandungi prototaip Next/Vinext yang tidak digunakan oleh GitHub Pages pada masa ini.

## Firebase / Firestore

Data langsung menggunakan struktur:

`publicSessions/{sessionCode}`

Subkoleksi utama:

- `players`
- `matches`
- `challenges`

Kamus tambahan guru disimpan dalam `globalDictionary`.

Peraturan Firestore semasa disimpan dalam `firestore.rules`. Jangan ganti peraturan sedia ada dengan peraturan terbuka semasa menguji kerana struktur semasa sudah menyokong aliran Sahibba yang digunakan.

## Ciri semasa

- Murid masuk menggunakan nama + kod permainan
- QR/pautan perkongsian permainan
- Padanan murid secara rawak
- Papan Sahibba 15×15 dan jubin sentuh
- Kamus asas kira-kira 47,000 perkataan
- Giliran dan skor disegerakkan melalui Firestore
- Skor lawan dikemas kini secara langsung
- Semakan perkataan oleh guru
- Kamus global guru
- Tamatkan permainan
- Arkib permainan, ringkasan dan papan akhir
- Padam permainan yang telah tamat
- Dashboard guru yang dipertingkat
- Paparan kelas/projektor langsung melalui `live.html?code=XXXX`

## Deployment

GitHub Actions melalui `.github/workflows/pages.yml` menyediakan folder `_site` dan menerbitkan aplikasi statik ke GitHub Pages setiap kali `main` dikemas kini. Workflow turut memastikan fail utama seperti `index.html`, `site.js`, `teacher-refresh.css` dan `live.html` wujud sebelum deployment diteruskan.

## Nota keselamatan

Akses guru menggunakan Google Sign-In dan peraturan Firestore. Murid tidak memerlukan akaun. Oleh sebab kemas kini perlawanan daripada murid masih dibenarkan pada dokumen match, peraturan Firestore boleh diperketatkan kemudian tanpa mengubah pengalaman masuk murid.

## Status

Versi semasa sudah menggunakan data Firestore masa nyata. Ia bukan lagi data demonstrasi. Fokus seterusnya ialah pengukuhan peraturan Firestore, pemadanan dan pengurusan sesi yang lebih fleksibel, serta penambahbaikan pengalaman guru dan murid.
