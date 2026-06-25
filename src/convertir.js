const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const CARPETA = './assets/images/imageWebp';

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
convertir('ejemplo.png');
// convertir('despues.png');
// convertir('otra.png');

//lo ejecutamos con 
// node src/imagen.png