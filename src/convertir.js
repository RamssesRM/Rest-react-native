const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const CARPETA = './assets/images';

async function convertir(nombreImagen) {
  const rutaPNG = path.join(CARPETA, nombreImagen);
  
  if (!fs.existsSync(rutaPNG)) {
    console.log(`❌ No existe: ${nombreImagen}`);
    return;
  }

  const nombreWebP = nombreImagen.replace('.png', '.webp');
  const rutaWebP = path.join(CARPETA, nombreWebP);

  try {
    await sharp(rutaPNG)
      .webp({ quality: 80 })
      .toFile(rutaWebP);

    console.log(`✅ ${nombreImagen} → ${nombreWebP}`);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

// ========== USO ==========
for(var i=9; i<15;i++){
  convertir(`${i}.png`);
}
// convertir('despues.png');
// convertir('otra.png');

//lo ejecutamos con 
// node src/imagen.png
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const CARPETA = './assets/images';

async function convertir(nombreImagen) {
  const rutaPNG = path.join(CARPETA, nombreImagen);
  
  if (!fs.existsSync(rutaPNG)) {
    console.log(`❌ No existe: ${nombreImagen}`);
    return;
  }

  const nombreWebP = nombreImagen.replace('.jpg', '.webp');
  const rutaWebP = path.join(CARPETA, nombreWebP);

  try {
    await sharp(rutaPNG)
      .webp({ quality: 80 })
      .toFile(rutaWebP);

    console.log(`✅ ${nombreImagen} → ${nombreWebP}`);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

// ========== USO ==========
for(var i=0; i<=7;i++){
  convertir(`${i}.jpg`);
}
// convertir('despues.png');
// convertir('otra.png');

//lo ejecutamos con 
// node src/imagen.png