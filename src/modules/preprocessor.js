/**
 * Image Preprocessing Module - Part 1
 * -------------------------------------------------------------
 * Converts colorful RGBA image pixel data into single-channel Grayscale (0–255).
 * Grayscale conversion reduces complexity by transforming 3 color channels (RGB)
 * into a single 8-bit intensity channel suitable for Huffman symbol analysis.
 * 
 * Formula: Y = 0.299*R + 0.587*G + 0.114*B (Standard ITU-R BT.601 Luma)
 * 
 * TODO (PART 2): Add spatial padding / power-of-2 resizing for Quadtree decomposition.
 */

/**
 * Converts ImageData to a Grayscale Uint8Array and creates a Grayscale Preview Canvas.
 * @param {ImageData} imageData - Raw RGBA image data from source canvas
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Object} Grayscale array (Uint8Array), 2D matrix, and preview canvas
 */
export function convertToGrayscale(imageData, width, height) {
  const data = imageData.data; // Flat array [R, G, B, A, R, G, B, A, ...]
  const totalPixels = width * height;
  
  // Uint8Array efficiently stores 8-bit unsigned integers (0 to 255)
  const grayscaleArray = new Uint8Array(totalPixels);
  
  // Create preview ImageData for rendering grayscale image in UI
  const grayscaleCanvas = document.createElement('canvas');
  grayscaleCanvas.width = width;
  grayscaleCanvas.height = height;
  const grayscaleCtx = grayscaleCanvas.getContext('2d');
  const grayscaleImageData = grayscaleCtx.createImageData(width, height);
  const outData = grayscaleImageData.data;

  // 2D matrix structure for spatial algorithms (useful for Quadtree in Part 2)
  const grayscaleMatrix = [];
  
  let pixelIndex = 0;
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const i = pixelIndex * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Standard Luminance calculation weighted by human vision sensitivity
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      
      grayscaleArray[pixelIndex] = gray;
      row.push(gray);

      // Populate preview image RGBA data
      outData[i] = gray;     // Red
      outData[i + 1] = gray; // Green
      outData[i + 2] = gray; // Blue
      outData[i + 3] = 255;  // Alpha (Fully opaque)

      pixelIndex++;
    }
    grayscaleMatrix.push(row);
  }

  // Draw the processed grayscale image onto the preview canvas
  grayscaleCtx.putImageData(grayscaleImageData, 0, 0);

  return {
    grayscaleArray,
    grayscaleMatrix,
    grayscaleCanvas,
    grayscaleDataUrl: grayscaleCanvas.toDataURL()
  };
}

/**
 * TODO (PART 2): Quadtree Preprocessor Function
 * Helper function to pad image dimensions to the nearest power of 2 (e.g. 256x256, 512x512)
 * for recursive Quadtree spatial decomposition.
 */
export function padToPowerOfTwo(grayscaleMatrix) {
  // TODO: Implement power-of-2 matrix padding in Part 2.
  console.log('TODO (PART 2): Quadtree spatial padding module');
  return grayscaleMatrix;
}
