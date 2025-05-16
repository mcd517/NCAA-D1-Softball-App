// scripts/generate-icons.js
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file and directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SVG_PATH = path.join(__dirname, '../public/softball-icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../public');

const sizes = [192, 512];

async function generateIcons() {
  console.log('Generating PWA icons from SVG...');
  
  try {
    // Ensure the SVG file exists
    if (!fs.existsSync(SVG_PATH)) {
      throw new Error(`SVG file not found at ${SVG_PATH}`);
    }
    
    // Generate each icon size
    for (const size of sizes) {
      const outputPath = path.join(OUTPUT_DIR, `softball-icon-${size}.png`);
      
      await sharp(SVG_PATH)
        .resize(size, size)
        .png()
        .toFile(outputPath);
        
      console.log(`Generated ${size}x${size} icon: ${outputPath}`);
    }
    
    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();