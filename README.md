# Sahibba Classroom

Permainan kata Bahasa Melayu untuk kelas. Murid menyertai sesi tanpa akaun, guru mengawal sesi melalui Google Sign-In, dan permainan menggunakan Firebase/Firestore untuk skor, giliran, pasangan, arkib dan pemantauan masa nyata.

## Production source of truth

GitHub Pages menggunakan aplikasi statik berikut:

- `index.html` — aplikasi utama murid dan guru
- `app/globals.css` — gaya asas aplikasi statik
- `site.js` — logik permainan, Firebase dan kemas kini masa nyata
- `dashboard.css` — komponen tambahan permainan/dashboard
- `teacher-refresh.css` + `teacher-refresh.js` — reka bentuk dashboard guru semasa
- `live.html`, `live.js`, `live.css` — paparan kelas/projektor secara langsung
- `kamus-47000.js` — kamus asas permainan
- `firebase-config.js` — konfigurasi Firebase + pemuatan aset dashboard semasa
- `firestore.rules` + `firebase.json` — konfigurasi/rules Firestore

Fail di atas ialah fail yang perlu dijaga apabila menambah baik Sahibba.

## Arkib / kod lama

Repositori masih mengandungi beberapa prototaip framework terdahulu seperti `app/*.tsx`, `app/teacher/`, `build/`, `db/`, `drizzle/`, `examples/`, `worker/`, konfigurasi Next/Vite/Drizzle, dan skrip build lama. Fail-fail ini **bukan sebahagian daripada aplikasi GitHub Pages production**.

Senarai penuh dan titik pemulihan kod lama direkodkan dalam `archive/README.md`. Kod lama juga kekal dalam sejarah Git, jadi ia boleh dipulihkan tanpa mencampurkannya dengan source-of-truth aplikasi production.

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
- Padanan rawak atau pasangan yang ditetapkan guru
- Papan Sahibba 15×15 dan jubin sentuh
- Kamus asas kira-kira 47,000 perkataan
- Had masa setiap giliran + auto pass/tukar jubin
- Giliran dan skor disegerakkan melalui Firestore
- Skor lawan dikemas kini secara langsung
- Semakan perkataan oleh guru
- Kamus global guru
- Tamatkan satu papan secara individu atau tamatkan keseluruhan permainan
- Arkib permainan, ringkasan dan papan akhir
- Padam permainan yang telah tamat
- Dashboard guru professional
- Paparan kelas/projektor langsung melalui `live.html?code=XXXX`

## Deployment

GitHub Pages branch deployment ialah satu-satunya laluan deployment production. Workflow `.github/workflows/pages.yml` kini hanya menjalankan pemeriksaan integriti dan sintaks; ia **tidak lagi deploy Pages**. Ini mengelakkan dua deployment berlumba dan menyebabkan UI lama muncul semula.

Validator memeriksa bahawa fail production utama wujud, JavaScript utama lulus syntax check, dan rujukan `index.html`, `live.html` serta kamus masih betul sebelum perubahan dianggap sihat.

## Nota keselamatan

Akses guru menggunakan Google Sign-In dan peraturan Firestore. Murid tidak memerlukan akaun. Kemas kini dokumen match daripada murid masih dibenarkan secara luas untuk pengalaman tanpa-login; ini ialah perkara keselamatan utama yang masih boleh diperketatkan kemudian.

## Status

Versi production ialah aplikasi statik Firebase di akar repositori. Prototaip Next/Vinext bukan lagi source-of-truth. Fokus pembangunan seterusnya hendaklah dibuat pada fail production yang disenaraikan di atas supaya fungsi, deployment dan UI tidak bercanggah.
