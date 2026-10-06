/**
 * Sample Preset Images Generator - Part 1
 * -------------------------------------------------------------
 * Provides lightweight synthetic sample images generated directly via HTML5 Canvas.
 * Allows instant testing of frequency analysis and Huffman code generation.
 */

/**
 * Generates a Data URL for a sample test image.
 * @param {'gradient' | 'checkerboard' | 'shapes'} type 
 * @param {number} width 
 * @param {number} height 
 * @returns {string} Base64 Data URL of the generated sample image
 */
export function generateSampleImageDataUrl(type = 'gradient', width = 128, height = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (type === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.3, '#3b82f6');
    grad.addColorStop(0.7, '#10b981');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (type === 'checkerboard') {
    const tileSize = 16;
    for (let y = 0; y < height; y += tileSize) {
      for (let x = 0; x < width; x += tileSize) {
        ctx.fillStyle = ((x / tileSize + y / tileSize) % 2 === 0) ? '#1e293b' : '#f8fafc';
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }
  } else if (type === 'shapes') {
    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    // Circles
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(width * 0.3, height * 0.3, 30, 0, Math.PI * 2);
    ctx.fill();
    // Rectangle
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(width * 0.55, height * 0.2, 45, 45);
    // Triangle
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(width * 0.4, height * 0.9);
    ctx.lineTo(width * 0.2, height * 0.6);
    ctx.lineTo(width * 0.6, height * 0.6);
    ctx.closePath();
    ctx.fill();
  }

  return canvas.toDataURL('image/png');
}
