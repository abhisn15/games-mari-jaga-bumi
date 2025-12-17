![Mari Jaga Bumi](public/assets/judul/judul.png)

Aplikasi web edukasi interaktif bertema lingkungan untuk anak-anak. Dibangun dengan Next.js (App Router) dan framer-motion, menghadirkan modul eksplorasi dan tiga mini-game: Hutan, Taman, dan Pantai.

## Fitur
- **Modul eksplorasi**: informasi interaktif per lingkungan.
- **Game Hutan**: tebak lokasi hewan tersembunyi.
- **Game Taman**: drag & drop pilah sampah.
- **Game Pantai**: drag & drop bersihkan pantai.
- **Reward & lencana**: progres disimpan lokal, halaman reward dengan badge.
- **Audio & animasi**: sound background per scene, efek konfeti dan modal sukses.
- **Responsif**: mendukung desktop, tablet, dan mobile (portrait/landscape), termasuk drag & drop sentuh.

## Instalasi & Pengembangan
```bash
npm install
npm run dev
# buka http://localhost:3000
```

## Build & Lint
```bash
npm run build
npm run lint
```

## Skrip utilitas
- `npm run compress-assets`: kompres PNG/MP4 (butuh `sharp`, opsional `ffmpeg`). Backup otomatis di `public/assets/_backup/`.

## Struktur penting
- `app/` : halaman utama, game, modul.
- `components/` : UI reusable (SoundManager, Toast, Modal, PageTransition, dll).
- `lib/` : helper (soundEffects, storage badges, content teks).
- `public/assets/` : gambar, video, audio.

## Pembuat
- Citra Ramadani – 2507431023  
- Muhammad Alif Rakasya – 2507431025  
- Faza Nimas Hayugi Putri Kamila – 2507431056  
- Rena Ade Widya – 2507431021  
