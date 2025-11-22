const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Directories with monument images
const directories = [
  'Памятники/Одиночные/800x800',
  'Памятники/Двойные/800x800',
  'Памятники/Составные/800x800',
  'Памятники/Мемориальные Комплексы/800x800',
  'Эксклюзивные'
];

// Sizes to generate
const sizes = [
  { width: 256, suffix: '256w' },
  { width: 512, suffix: '512w' }
];

async function processDirectory(dirPath) {
  const fullPath = path.join(publicDir, dirPath);
  
  try {
    const files = await fs.readdir(fullPath, { recursive: true });
    
    for (const file of files) {
      // Only process .webp and .jpg files
      if (!/\.(webp|jpg|jpeg)$/i.test(file)) continue;
      
      const filePath = path.join(fullPath, file);
      const stat = await fs.stat(filePath);
      
      if (!stat.isFile()) continue;
      
      const fileName = path.basename(file, path.extname(file));
      const fileDir = path.dirname(filePath);
      
      console.log(`Processing ${file}...`);
      
      for (const size of sizes) {
        const outputPath = path.join(fileDir, `${fileName}-${size.suffix}.webp`);
        
        // Skip if already exists
        try {
          await fs.access(outputPath);
          console.log(`  ✓ ${size.suffix} already exists, skipping`);
          continue;
        } catch {
          // File doesn't exist, create it
        }
        
        await sharp(filePath)
          .resize(size.width, size.width, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toFile(outputPath);
        
        console.log(`  ✓ Created ${size.suffix}`);
      }
    }
    
    console.log(`✓ Completed ${dirPath}\n`);
  } catch (error) {
    console.error(`Error processing ${dirPath}:`, error.message);
  }
}

async function main() {
  console.log('Starting monument image optimization...\n');
  
  for (const dir of directories) {
    await processDirectory(dir);
  }
  
  console.log('✓ All monument images optimized!');
}

main().catch(console.error);
