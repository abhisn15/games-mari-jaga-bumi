# Scripts untuk Optimasi Assets

## Kompresi Assets Otomatis

Script ini akan mengompresi file PNG dan MP4 secara otomatis untuk mengurangi ukuran file.

### Instalasi Dependencies

```bash
# Install sharp untuk kompresi PNG
npm install --save-dev sharp

# Install ffmpeg untuk kompresi MP4 (opsional)
# macOS:
brew install ffmpeg

# Linux (Ubuntu/Debian):
sudo apt-get install ffmpeg

# Windows:
# Download dari https://ffmpeg.org/download.html
```

### Menjalankan Kompresi

```bash
npm run compress-assets
```

### Fitur

- ✅ Backup otomatis: File original akan di-backup di `public/assets/_backup/`
- ✅ Kompresi PNG: Menggunakan sharp dengan quality 85 dan compression level 9
- ✅ Kompresi MP4: Menggunakan ffmpeg dengan CRF 28 (balance quality/size)
- ✅ Safe: Jika hasil kompresi lebih besar, file original akan digunakan
- ✅ Progress report: Menampilkan ukuran sebelum/sesudah dan persentase penghematan

### Catatan

- Script akan skip file jika tool yang diperlukan tidak tersedia
- File backup tersimpan di `public/assets/_backup/`
- Untuk video besar (seperti home.mp4 26MB), kompresi bisa memakan waktu beberapa menit

