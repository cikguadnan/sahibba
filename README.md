# Sahibba Classroom

Permainan kata Bahasa Melayu untuk kelas. Murid menyertai sesi tanpa akaun, dipadankan secara rawak dan bermain secara bergilir. Guru menggunakan Google Sign-In untuk membuka pusat kawalan, menyemak cabaran perkataan dan memantau semua perlawanan.

## Akaun guru

Hanya akaun Google `mradnanmahmud@gmail.com` dibenarkan membuka pusat kawalan. Sekatan ini dilaksanakan dalam antaramuka dan `firestore.rules`.

## Penyediaan Firebase

1. Cipta projek di Firebase Console.
2. Aktifkan **Authentication → Sign-in method → Google**.
3. Cipta pangkalan data **Cloud Firestore**.
4. Daftarkan Web App dan salin konfigurasi Firebase.
5. Salin `.env.example` kepada `.env.local` dan isi semua nilainya.
6. Terbitkan `firestore.rules` dalam Firebase Console.
7. Tambah domain tapak dalam **Authentication → Settings → Authorized domains**.

## Menjalankan projek

```bash
npm install
npm run dev
```

## Pemboleh ubah persekitaran

`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, dan `NEXT_PUBLIC_FIREBASE_APP_ID`.

Jangan simpan `.env.local` dalam GitHub. Peraturan Firestore menjadi perlindungan sebenar untuk data guru.

## Status prototaip

Aliran murid, paparan permainan, semakan perkataan dan pusat kawalan guru telah tersedia. Data perlawanan pada versi ini masih data demonstrasi; langkah seterusnya ialah menyambungkan semua tindakan permainan kepada koleksi Firestore secara masa nyata.
