/**
 * Image Handler Module - Part 1
 * -------------------------------------------------------------
 * Responsible for loading image files, rendering them onto HTML5 Canvas,
 * extracting raw RGBA pixel data, and gathering image metadata.
 * 
 * TODO (PART 2): Add image export and compressed file saver module.
 */

/**
 * Formats byte size into human-readable string (B, KB, MB)
 * @param {number} bytes 
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Loads an image file and extracts metadata and RGBA canvas data.
 * @param {File | Blob | string} source - File object, Blob, or Data URL
 * @param {string} fileName - Optional file name
 * @returns {Promise<Object>} Image details including dimensions, format, raw canvas, and imageData
 */
export async function loadImageSource(source, fileName = 'sample_image.png') {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    let fileUrl;
    let fileSizeBytes = 0;
    let mimeType = 'image/png';

    if (source instanceof File || source instanceof Blob) {
      fileUrl = URL.createObjectURL(source);
      fileSizeBytes = source.size;
      mimeType = source.type || 'image/png';
    } else if (typeof source === 'string') {
      fileUrl = source;
      // Estimate base64 length or synthetic image size
      fileSizeBytes = Math.round(source.length * 0.75);
    } else {
      reject(new Error('Invalid image source type provided.'));
      return;
    }

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const totalPixels = width * height;

      // Create an off-screen canvas to capture pixel data
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, width, height);

      resolve({
        fileName,
        width,
        height,
        mimeType: mimeType.replace('image/', '').toUpperCase(),
        totalPixels,
        fileSizeBytes,
        formattedSize: formatBytes(fileSizeBytes),
        canvas,
        ctx,
        imageData,
        imageElement: img,
        src: fileUrl
      });
    };

    img.onerror = (err) => {
      reject(new Error('Failed to load image. Please select a valid image file.'));
    };

    img.src = fileUrl;
  });
}
