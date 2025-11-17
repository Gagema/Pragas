// middleware/imageOptimization.js
// Middleware para compressão e otimização de imagens

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Otimiza imagens após upload
 * @param {string} imagePath - Caminho da imagem original
 * @param {object} options - Opções de otimização
 */
async function optimizeImage(imagePath, options = {}) {
  const {
    quality = 80,
    maxWidth = 1920,
    maxHeight = 1080,
    formats = ['webp', 'jpeg']
  } = options;

  try {
    const absolutePath = path.join(__dirname, '..', 'public', imagePath);
    const parsedPath = path.parse(absolutePath);
    const directory = parsedPath.dir;
    const filename = parsedPath.name;

    // Criar versões otimizadas
    const image = sharp(absolutePath);
    const metadata = await image.metadata();

    // Calcular dimensões mantendo aspect ratio
    let width = metadata.width;
    let height = metadata.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const optimizedPaths = [];

    // Gerar WebP (melhor compressão)
    if (formats.includes('webp')) {
      const webpPath = path.join(directory, `${filename}.webp`);
      await image
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality })
        .toFile(webpPath);
      
      optimizedPaths.push({
        format: 'webp',
        path: imagePath.replace(path.extname(imagePath), '.webp'),
        size: fs.statSync(webpPath).size
      });
    }

    // Gerar JPEG otimizado (fallback)
    if (formats.includes('jpeg')) {
      const jpegPath = path.join(directory, `${filename}-optimized.jpg`);
      await image
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality, progressive: true })
        .toFile(jpegPath);
      
      optimizedPaths.push({
        format: 'jpeg',
        path: imagePath.replace(path.extname(imagePath), '-optimized.jpg'),
        size: fs.statSync(jpegPath).size
      });
    }

    // Gerar thumbnail
    const thumbPath = path.join(directory, `${filename}-thumb.jpg`);
    await image
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toFile(thumbPath);
    
    optimizedPaths.push({
      format: 'thumbnail',
      path: imagePath.replace(path.extname(imagePath), '-thumb.jpg'),
      size: fs.statSync(thumbPath).size
    });

    return optimizedPaths;
  } catch (error) {
    console.error('Erro ao otimizar imagem:', error);
    throw error;
  }
}

/**
 * Middleware para otimizar imagens de upload automaticamente
 */
function imageOptimizationMiddleware(options = {}) {
  return async (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    try {
      // Upload único
      if (req.file) {
        const imagePath = '/images/' + req.file.filename;
        req.optimizedImages = await optimizeImage(imagePath, options);
      }

      // Múltiplos uploads
      if (req.files) {
        req.optimizedImages = {};
        
        for (const field in req.files) {
          const files = Array.isArray(req.files[field]) 
            ? req.files[field] 
            : [req.files[field]];
          
          req.optimizedImages[field] = [];
          
          for (const file of files) {
            const imagePath = '/images/' + file.filename;
            const optimized = await optimizeImage(imagePath, options);
            req.optimizedImages[field].push(optimized);
          }
        }
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de otimização:', error);
      next(); // Continua mesmo se otimização falhar
    }
  };
}

/**
 * Retorna caminho da imagem otimizada (WebP se disponível)
 */
function getOptimizedImagePath(originalPath) {
  if (!originalPath) return null;
  
  const webpPath = originalPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const absoluteWebpPath = path.join(__dirname, '..', 'public', webpPath);
  
  // Verifica se versão WebP existe
  if (fs.existsSync(absoluteWebpPath)) {
    return webpPath;
  }
  
  return originalPath;
}

module.exports = {
  optimizeImage,
  imageOptimizationMiddleware,
  getOptimizedImagePath
};
