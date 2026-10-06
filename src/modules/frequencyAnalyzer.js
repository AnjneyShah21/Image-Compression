/**
 * Frequency Analysis & Entropy Module - Part 1
 * -------------------------------------------------------------
 * Analyzes the distribution of pixel intensities (0 to 255) across the grayscale image.
 * Calculates probability distributions and Shannon Entropy (theoretical minimum bits/pixel).
 * 
 * Shannon Entropy Formula:
 * H(X) = - SUM [ p(x_i) * log2(p(x_i)) ]
 * 
 * TODO (PART 2): Add entropy analysis comparison after Quadtree spatial segmentation.
 */

/**
 * Generates a complete frequency table and statistical summary for pixel intensities (0–255).
 * @param {Uint8Array} grayscaleArray - Flat array of 8-bit grayscale pixel intensities
 * @returns {Object} Frequency counts, probabilities, entropy, and sorted symbol list
 */
export function analyzeFrequencies(grayscaleArray) {
  const totalPixels = grayscaleArray.length;
  
  // Frequency map for intensities 0 through 255 initialized to 0
  const freqMap = new Array(256).fill(0);
  
  let sumIntensity = 0;
  let minIntensity = 255;
  let maxIntensity = 0;

  // Count pixel intensity occurrences
  for (let i = 0; i < totalPixels; i++) {
    const val = grayscaleArray[i];
    freqMap[val]++;
    sumIntensity += val;
    if (val < minIntensity) minIntensity = val;
    if (val > maxIntensity) maxIntensity = val;
  }

  const avgIntensity = totalPixels > 0 ? (sumIntensity / totalPixels).toFixed(2) : 0;

  // Calculate probabilities, entropy, and filter symbols with frequency > 0
  let entropy = 0;
  let uniqueSymbolsCount = 0;
  const frequencyTable = [];

  for (let intensity = 0; intensity < 256; intensity++) {
    const freq = freqMap[intensity];
    if (freq > 0) {
      uniqueSymbolsCount++;
      const prob = freq / totalPixels;
      // Entropy contribution: - p_i * log2(p_i)
      entropy -= prob * (Math.log2(prob));

      frequencyTable.push({
        symbol: intensity, // Pixel intensity value 0..255
        frequency: freq,
        probability: prob,
        percentage: (prob * 100).toFixed(3)
      });
    }
  }

  // Sort symbols by frequency descending (most frequent first)
  frequencyTable.sort((a, b) => b.frequency - a.frequency);

  // Raw baseline bit requirement (8 bits per grayscale pixel)
  const rawBitSize = totalPixels * 8;
  // Theoretical minimum bit requirement according to Shannon Entropy theorem
  const theoreticalEntropyBitSize = Math.ceil(totalPixels * entropy);

  return {
    freqMap,
    frequencyTable,
    totalPixels,
    uniqueSymbolsCount,
    minIntensity,
    maxIntensity,
    avgIntensity,
    entropy: entropy.toFixed(4), // bits per pixel
    rawBitSize,
    theoreticalEntropyBitSize,
    theoreticalSavingPercent: (((rawBitSize - theoreticalEntropyBitSize) / rawBitSize) * 100).toFixed(2)
  };
}
