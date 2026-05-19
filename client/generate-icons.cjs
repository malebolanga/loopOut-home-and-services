const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SVG_PATH = path.join(__dirname, 'public', 'loopout_icon.svg');

// Web app targets inside client/public and client root
const WEB_TARGETS = [
  { name: 'apple-touch-icon.png', size: 180, isTransparent: false, bgColor: '#FFFFFF', writeToRoot: true },
  { name: 'favicon-32x32.png', size: 32, isTransparent: true, writeToRoot: true },
  { name: 'favicon-16x16.png', size: 16, isTransparent: true, writeToRoot: true },
  { name: 'logo192.png', size: 192, isTransparent: true },
  { name: 'logo512.png', size: 512, isTransparent: true },
  { name: 'android-chrome-512x512.png', size: 512, isTransparent: true, writeToRoot: true },
  { name: 'maskable.png', size: 512, isTransparent: false, bgColor: '#FFFFFF', paddingRatio: 0.25, writeToRoot: true },
  // JPG versions in root
  { name: 'logo192.jpg', size: 192, isTransparent: false, bgColor: '#FFFFFF', isJpg: true, writeToRootOnly: true },
  { name: 'logo256.jpg', size: 256, isTransparent: false, bgColor: '#FFFFFF', isJpg: true, writeToRootOnly: true },
  { name: 'logo384.jpg', size: 384, isTransparent: false, bgColor: '#FFFFFF', isJpg: true, writeToRootOnly: true },
  { name: 'logo512.jpg', size: 512, isTransparent: false, bgColor: '#FFFFFF', isJpg: true, writeToRootOnly: true },
  // Favicon.ico in root
  { name: 'favicon.ico', size: 32, isTransparent: true, writeToRootOnly: true }
];

// Android launcher targets inside client/android/app/src/main/res/
const ANDROID_RES_DIR = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
const ANDROID_TARGETS = [
  { mipmap: 'mipmap-mdpi', legacySize: 48, foregroundSize: 108 },
  { mipmap: 'mipmap-hdpi', legacySize: 72, foregroundSize: 162 },
  { mipmap: 'mipmap-xhdpi', legacySize: 96, foregroundSize: 216 },
  { mipmap: 'mipmap-xxhdpi', legacySize: 144, foregroundSize: 324 },
  { mipmap: 'mipmap-xxxhdpi', legacySize: 192, foregroundSize: 432 }
];

async function generateWebIcons() {
  console.log('Generating Web and PWA Icons...');
  for (const target of WEB_TARGETS) {
    let s = sharp(SVG_PATH);
    
    if (target.paddingRatio) {
      // For maskable, resize logo smaller and place on background
      const logoSize = Math.round(target.size * (1 - target.paddingRatio));
      const logoBuffer = await sharp(SVG_PATH).resize(logoSize, logoSize).png().toBuffer();
      s = sharp({
        create: {
          width: target.size,
          height: target.size,
          channels: 4,
          background: target.bgColor || '#FFFFFF'
        }
      }).composite([{ input: logoBuffer, blend: 'over' }]);
    } else if (!target.isTransparent) {
      // Non-transparent base background (e.g. apple-touch-icon)
      const logoBuffer = await sharp(SVG_PATH).resize(target.size, target.size).png().toBuffer();
      s = sharp({
        create: {
          width: target.size,
          height: target.size,
          channels: 4,
          background: target.bgColor || '#FFFFFF'
        }
      }).composite([{ input: logoBuffer, blend: 'over' }]);
    } else {
      s = s.resize(target.size, target.size);
    }

    if (target.isJpg) {
      s = s.jpeg({ quality: 90 });
    } else {
      s = s.png();
    }

    const publicPath = path.join(__dirname, 'public', target.name);
    const rootPath = path.join(__dirname, target.name);

    if (!target.writeToRootOnly) {
      await s.toFile(publicPath);
      console.log(`- Generated public/${target.name} (${target.size}x${target.size})`);
    }
    
    if (target.writeToRoot || target.writeToRootOnly) {
      // Create a new instance for the second file write if needed
      let sRoot = sharp(SVG_PATH);
      if (target.paddingRatio) {
        const logoSize = Math.round(target.size * (1 - target.paddingRatio));
        const logoBuffer = await sharp(SVG_PATH).resize(logoSize, logoSize).png().toBuffer();
        sRoot = sharp({
          create: {
            width: target.size,
            height: target.size,
            channels: 4,
            background: target.bgColor || '#FFFFFF'
          }
        }).composite([{ input: logoBuffer, blend: 'over' }]);
      } else if (!target.isTransparent) {
        const logoBuffer = await sharp(SVG_PATH).resize(target.size, target.size).png().toBuffer();
        sRoot = sharp({
          create: {
            width: target.size,
            height: target.size,
            channels: 4,
            background: target.bgColor || '#FFFFFF'
          }
        }).composite([{ input: logoBuffer, blend: 'over' }]);
      } else {
        sRoot = sRoot.resize(target.size, target.size);
      }

      if (target.isJpg) {
        sRoot = sRoot.jpeg({ quality: 90 });
      } else {
        sRoot = sRoot.png();
      }

      await sRoot.toFile(rootPath);
      console.log(`- Generated root ${target.name} (${target.size}x${target.size})`);
    }
  }
}

async function generateAndroidIcons() {
  console.log('Generating Android Mipmap Icons...');
  if (!fs.existsSync(ANDROID_RES_DIR)) {
    console.warn(`Android resource directory not found at ${ANDROID_RES_DIR}, skipping Android asset generation.`);
    return;
  }

  for (const target of ANDROID_TARGETS) {
    const mipmapPath = path.join(ANDROID_RES_DIR, target.mipmap);
    if (!fs.existsSync(mipmapPath)) {
      fs.mkdirSync(mipmapPath, { recursive: true });
    }

    // 1. Legacy Launcher Icon (ic_launcher.png) - Transparent or on white
    const legacyDest = path.join(mipmapPath, 'ic_launcher.png');
    await sharp(SVG_PATH)
      .resize(target.legacySize, target.legacySize)
      .png()
      .toFile(legacyDest);
    console.log(`- Generated ${target.mipmap}/ic_launcher.png (${target.legacySize}x${target.legacySize})`);

    // 2. Round Launcher Icon (ic_launcher_round.png)
    const roundDest = path.join(mipmapPath, 'ic_launcher_round.png');
    await sharp(SVG_PATH)
      .resize(target.legacySize, target.legacySize)
      .png()
      .toFile(roundDest);
    console.log(`- Generated ${target.mipmap}/ic_launcher_round.png (${target.legacySize}x${target.legacySize})`);

    // 3. Adaptive Foreground Icon (ic_launcher_foreground.png)
    const foreDest = path.join(mipmapPath, 'ic_launcher_foreground.png');
    const logoSize = Math.round(target.foregroundSize * 0.66);
    const logoBuffer = await sharp(SVG_PATH).resize(logoSize, logoSize).png().toBuffer();
    
    await sharp({
      create: {
        width: target.foregroundSize,
        height: target.foregroundSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent background
      }
    })
    .composite([{ input: logoBuffer, blend: 'over' }])
    .png()
    .toFile(foreDest);
    console.log(`- Generated ${target.mipmap}/ic_launcher_foreground.png (${target.foregroundSize}x${target.foregroundSize})`);
  }
}

async function main() {
  try {
    await generateWebIcons();
    await generateAndroidIcons();
    console.log('\nAll assets generated successfully!');
  } catch (err) {
    console.error('Error generating assets:', err);
    process.exit(1);
  }
}

main();
