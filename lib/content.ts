import { Environment } from './types';

export const petunjukText = `
Ketuk setiap gambar untuk melihat penjelasannya. Selesaikan semua game untuk mendapatkan lencana!
`;

export const tentangText = `
Aplikasi ini mengajak anak-anak belajar tentang lingkungan alam, kebersihan, dan cara menjaga bumi.

Dibuat oleh:
• Citra Ramadani – 2507431023
• Muhammad Alif Rakasya – 2507431025
• Faza Nimas Hayugi Putri Kamila – 2507431056
• Rena Ade Widya – 2507431021
`;

export const environments: Environment[] = [
  {
    id: 'hutan',
    title: 'Hutan Hijau yang Indah!',
    badgeName: 'Pahlawan Hutan',
    narration: 'Hutan adalah rumah bagi banyak hewan dan tumbuhan. Yuk kenalan!',
    hotspots: [
      {
        id: 'burung_hantu',
        title: 'Burung Hantu 🦉',
        body: 'Burung hantu suka berburu di malam hari. Mereka punya mata yang tajam.',
        emoji: '🦉',
        x: 15,
        y: 20,
        w: 12,
        h: 15,
      },
      {
        id: 'rusa',
        title: 'Rusa 🦌',
        body: 'Rusa adalah hewan pemakan tumbuhan. Mereka berlari sangat cepat!',
        emoji: '🦌',
        x: 50,
        y: 50,
        w: 15,
        h: 18,
      },
      {
        id: 'jamur',
        title: 'Jamur 🍄',
        body: 'Jamur tumbuh di tempat lembab. Jangan dimakan tanpa izin orang dewasa.',
        emoji: '🍄',
        x: 30,
        y: 70,
        w: 10,
        h: 12,
      },
      {
        id: 'pohon_besar',
        title: 'Pohon Besar 🌳',
        body: 'Pohon menghasilkan oksigen yang kita hirup setiap hari.',
        emoji: '🌳',
        x: 65,
        y: 25,
        w: 18,
        h: 30,
      },
      {
        id: 'sungai',
        title: 'Sungai 💧',
        body: 'Sungai adalah tempat minum hewan dan mengalirkan air ke hutan.',
        emoji: '💧',
        x: 5,
        y: 60,
        w: 20,
        h: 15,
      },
    ],
  },
  {
    id: 'taman',
    title: 'Taman Kota yang Bersih!',
    badgeName: 'Penjaga Taman',
    narration: 'Di taman, kita harus menjaga kebersihan supaya nyaman dan sehat.',
    hotspots: [
      {
        id: 'organik',
        title: 'Organik (Hijau) 🟢',
        body: 'Sampah organik berasal dari sisa makhluk hidup, seperti daun dan sisa makanan.',
        emoji: '🟢',
        x: 20,
        y: 50,
        w: 15,
        h: 20,
      },
      {
        id: 'plastik',
        title: 'Plastik (Kuning) 🟡',
        body: 'Plastik butuh waktu lama untuk terurai. Jadi harus didaur ulang.',
        emoji: '🟡',
        x: 45,
        y: 50,
        w: 15,
        h: 20,
      },
      {
        id: 'kertas',
        title: 'Kertas (Biru) 🔵',
        body: 'Kertas bisa didaur ulang menjadi kertas baru. Jangan dibuang sembarangan!',
        emoji: '🔵',
        x: 70,
        y: 50,
        w: 15,
        h: 20,
      },
    ],
  },
  {
    id: 'pantai',
    title: 'Pantai Biru yang Indah!',
    badgeName: 'Sahabat Laut',
    narration: 'Pantai adalah rumah bagi hewan laut. Tapi sampah bisa membahayakan mereka.',
    hotspots: [
      {
        id: 'penyu',
        title: 'Penyu 🐢',
        body: 'Penyu bisa salah makan plastik karena dikira ubur-ubur.',
        emoji: '🐢',
        x: 25,
        y: 40,
        w: 15,
        h: 12,
      },
      {
        id: 'kepiting',
        title: 'Kepiting 🦀',
        body: 'Kepiting hidup di pasir dan mencari makan di tepi pantai.',
        emoji: '🦀',
        x: 60,
        y: 65,
        w: 12,
        h: 10,
      },
      {
        id: 'karang',
        title: 'Karang Laut 🪸',
        body: 'Karang adalah rumah ikan. Kita harus menjaganya dari polusi.',
        emoji: '🪸',
        x: 50,
        y: 55,
        w: 18,
        h: 15,
      },
      {
        id: 'ombak',
        title: 'Ombak 🌊',
        body: 'Ombak membawa air segar ke pantai.',
        emoji: '🌊',
        x: 10,
        y: 20,
        w: 25,
        h: 15,
      },
    ],
  },
];

export function getEnvironment(id: 'hutan' | 'taman' | 'pantai'): Environment | undefined {
  return environments.find((env) => env.id === id);
}

