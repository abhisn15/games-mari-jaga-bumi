#!/usr/bin/env node

/**
 * Script untuk kompresi otomatis assets (PNG dan MP4)
 * Menjalankan: npm run compress-assets
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets');
const BACKUP_DIR = path.join(process.cwd(), 'public', 'assets', '_backup');

// Cek apakah sharp terinstall
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  sharp tidak terinstall. Install dengan: npm install --save-dev sharp');
  console.log('   Script akan skip kompresi PNG.');
}

// Cek apakah ffmpeg tersedia
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

const hasFFmpeg = checkFFmpeg();
if (!hasFFmpeg) {
  console.log('⚠️  ffmpeg tidak ditemukan. Install ffmpeg untuk kompresi video.');
  console.log('   macOS: brew install ffmpeg');
  console.log('   Script akan skip kompresi MP4.');
}

// Buat backup directory
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log('📁 Backup directory dibuat:', BACKUP_DIR);
  }
}

// Backup file sebelum kompresi
function backupFile(filePath) {
  const relativePath = path.relative(ASSETS_DIR, filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);
  const backupDir = path.dirname(backupPath);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

// Kompres PNG menggunakan sharp
async function compressPNG(inputPath, outputPath) {
  if (!sharp) {
    console.log(`⏭️  Skip ${path.basename(inputPath)} (sharp tidak tersedia)`);
    return false;
  }

  try {
    const originalSize = fs.statSync(inputPath).size;
    
    await sharp(inputPath)
      .png({ 
        quality: 85,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toFile(outputPath);
    
    const newSize = fs.statSync(outputPath).size;
    const saved = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    if (newSize < originalSize) {
      console.log(`✅ ${path.basename(inputPath)}: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (${saved}% saved)`);
      return true;
    } else {
      // Jika hasil lebih besar, gunakan file original
      fs.unlinkSync(outputPath);
      fs.copyFileSync(inputPath, outputPath);
      console.log(`⚠️  ${path.basename(inputPath)}: Tidak bisa dikompres lebih lanjut`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error kompresi ${inputPath}:`, error.message);
    return false;
  }
}

// Kompres MP4 menggunakan ffmpeg
function compressMP4(inputPath, outputPath) {
  if (!hasFFmpeg) {
    console.log(`⏭️  Skip ${path.basename(inputPath)} (ffmpeg tidak tersedia)`);
    return false;
  }

  try {
    const originalSize = fs.statSync(inputPath).size;
    
    // Kompres dengan H.264, CRF 28 (balance antara quality dan size)
    execSync(
      `ffmpeg -i "${inputPath}" -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 128k -movflags +faststart "${outputPath}" -y`,
      { stdio: 'ignore' }
    );
    
    const newSize = fs.statSync(outputPath).size;
    const saved = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    if (newSize < originalSize) {
      console.log(`✅ ${path.basename(inputPath)}: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(newSize / 1024 / 1024).toFixed(1)}MB (${saved}% saved)`);
      return true;
    } else {
      fs.unlinkSync(outputPath);
      fs.copyFileSync(inputPath, outputPath);
      console.log(`⚠️  ${path.basename(inputPath)}: Tidak bisa dikompres lebih lanjut`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error kompresi ${inputPath}:`, error.message);
    return false;
  }
}

// Temukan semua file PNG dan MP4
function findAssets(dir, extensions = ['.png', '.mp4']) {
  const files = [];
  
  function walkDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip backup directory
        if (entry.name !== '_backup') {
          walkDir(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walkDir(dir);
  return files;
}

// Main function
async function main() {
  console.log('🚀 Memulai kompresi assets...\n');
  
  ensureBackupDir();
  
  const pngFiles = findAssets(ASSETS_DIR, ['.png']);
  const mp4Files = findAssets(ASSETS_DIR, ['.mp4']);
  
  let totalSaved = 0;
  let filesProcessed = 0;
  
  // Kompres PNG files
  if (pngFiles.length > 0) {
    console.log(`📸 Menemukan ${pngFiles.length} file PNG\n`);
    for (const file of pngFiles) {
      const originalSize = fs.statSync(file).size;
      const backupPath = backupFile(file);
      const tempPath = file + '.tmp';
      
      const compressed = await compressPNG(file, tempPath);
      
      if (compressed) {
        const newSize = fs.statSync(tempPath).size;
        totalSaved += (originalSize - newSize);
        filesProcessed++;
        fs.renameSync(tempPath, file);
      } else {
        fs.unlinkSync(tempPath);
      }
    }
  }
  
  // Kompres MP4 files
  if (mp4Files.length > 0) {
    console.log(`\n🎬 Menemukan ${mp4Files.length} file MP4\n`);
    for (const file of mp4Files) {
      const originalSize = fs.statSync(file).size;
      const backupPath = backupFile(file);
      const tempPath = file + '.tmp';
      
      const compressed = compressMP4(file, tempPath);
      
      if (compressed) {
        const newSize = fs.statSync(tempPath).size;
        totalSaved += (originalSize - newSize);
        filesProcessed++;
        fs.renameSync(tempPath, file);
      } else {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    }
  }
  
  console.log(`\n✨ Selesai!`);
  console.log(`   File diproses: ${filesProcessed}`);
  console.log(`   Total penghematan: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Backup tersimpan di: ${BACKUP_DIR}`);
}

main().catch(console.error);

