/**
 * Huffman Tree & Code Generator Module - Part 1
 * -------------------------------------------------------------
 * Foundation of Huffman Coding Algorithm:
 * 1. HuffmanNode class representing leaf and internal nodes.
 * 2. MinHeap / PriorityQueue for O(N log N) greedy tree construction.
 * 3. Bottom-up Huffman tree builder merging two lowest frequency nodes.
 * 4. Recursive pre-order traversal for generating variable-length binary codes ('0' left, '1' right).
 * 5. Theoretical metrics calculation (Average code length vs. 8-bit baseline).
 * 
 * TODO (PART 2): Implement BitStream packing, Huffman Bit Table header serialization, and Decompressor.
 */

/**
 * Node structure for the Huffman Binary Tree.
 */
export class HuffmanNode {
  /**
   * @param {number|null} symbol - Pixel intensity (0..255) for leaf nodes; null for internal nodes
   * @param {number} freq - Frequency count of the symbol or combined subtree weight
   * @param {HuffmanNode|null} left - Left child node (assigned bit '0')
   * @param {HuffmanNode|null} right - Right child node (assigned bit '1')
   */
  constructor(symbol, freq, left = null, right = null) {
    this.symbol = symbol;
    this.freq = freq;
    this.left = left;
    this.right = right;
    this.id = Math.random().toString(36).substring(2, 9); // Unique ID for visualization
  }

  /**
   * Checks if this node is a leaf node (contains an actual pixel symbol).
   * @returns {boolean}
   */
  isLeaf() {
    return this.left === null && this.right === null;
  }
}

/**
 * Min-Heap Priority Queue implementation for efficient Huffman Tree construction.
 */
export class PriorityQueue {
  constructor() {
    /** @type {HuffmanNode[]} */
    this.heap = [];
  }

  /** @returns {number} */
  size() {
    return this.heap.length;
  }

  /**
   * Pushes a new node into the heap and restores min-heap property.
   * @param {HuffmanNode} node 
   */
  enqueue(node) {
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
  }

  /**
   * Removes and returns the node with the lowest frequency.
   * @returns {HuffmanNode|null}
   */
  dequeue() {
    if (this.size() === 0) return null;
    if (this.size() === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._sinkDown(0);
    return min;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.heap[index].freq >= this.heap[parentIdx].freq) break;
      
      // Swap with parent
      [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]];
      index = parentIdx;
    }
  }

  _sinkDown(index) {
    const length = this.heap.length;
    while (true) {
      let leftChildIdx = 2 * index + 1;
      let rightChildIdx = 2 * index + 2;
      let smallest = index;

      if (leftChildIdx < length && this.heap[leftChildIdx].freq < this.heap[smallest].freq) {
        smallest = leftChildIdx;
      }

      if (rightChildIdx < length && this.heap[rightChildIdx].freq < this.heap[smallest].freq) {
        smallest = rightChildIdx;
      }

      if (smallest === index) break;

      // Swap with smallest child
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

/**
 * Constructs the Huffman Tree from a frequency table.
 * 
 * Algorithm Steps:
 * 1. Create a leaf node for each non-zero pixel frequency and insert into Priority Queue.
 * 2. While queue has more than 1 node:
 *    a. Dequeue the two nodes with the lowest frequencies (N1, N2).
 *    b. Create a new internal node with combined frequency (N1.freq + N2.freq), setting N1 as left, N2 as right.
 *    c. Enqueue the internal node back into Priority Queue.
 * 3. The remaining node is the Root of the Huffman Tree.
 * 
 * @param {Array<{symbol: number, frequency: number}>} frequencyTable 
 * @returns {HuffmanNode|null} Root of the Huffman Tree
 */
export function buildHuffmanTree(frequencyTable) {
  if (!frequencyTable || frequencyTable.length === 0) return null;

  const pq = new PriorityQueue();

  // Step 1: Enqueue leaf nodes
  frequencyTable.forEach(item => {
    pq.enqueue(new HuffmanNode(item.symbol, item.frequency));
  });

  // Edge case: single unique intensity in entire image
  if (pq.size() === 1) {
    const singleLeaf = pq.dequeue();
    const parent = new HuffmanNode(null, singleLeaf.freq, singleLeaf, null);
    return parent;
  }

  // Step 2: Merge nodes until only 1 root node remains
  while (pq.size() > 1) {
    const left = pq.dequeue();
    const right = pq.dequeue();

    const parentFreq = left.freq + right.freq;
    const parentNode = new HuffmanNode(null, parentFreq, left, right);

    pq.enqueue(parentNode);
  }

  // Step 3: Return Root Node
  return pq.dequeue();
}

/**
 * Traverses the Huffman tree to generate prefix-free binary codes for each symbol.
 * Left branch = '0', Right branch = '1'
 * 
 * @param {HuffmanNode} root - Root of the Huffman tree
 * @returns {Map<number, string>} Map of symbol (0..255) -> binary code string
 */
export function generateHuffmanCodes(root) {
  const codeMap = new Map();

  function traverse(node, currentCode) {
    if (!node) return;

    if (node.isLeaf()) {
      // Handle edge case where root is a parent of a single leaf node
      codeMap.set(node.symbol, currentCode || '0');
      return;
    }

    if (node.left) traverse(node.left, currentCode + '0');
    if (node.right) traverse(node.right, currentCode + '1');
  }

  traverse(root, '');
  return codeMap;
}

/**
 * Computes theoretical Huffman coding statistics based on generated codes and frequency analysis.
 * 
 * @param {Array<Object>} frequencyTable 
 * @param {Map<number, string>} codeMap 
 * @param {number} totalPixels 
 * @returns {Object} Comprehensive coding metrics
 */
export function calculateHuffmanStats(frequencyTable, codeMap, totalPixels) {
  let totalTheoreticalBits = 0;
  let totalBitsOriginal = totalPixels * 8; // Baseline 8 bits per pixel

  const codeDetailsList = [];

  frequencyTable.forEach(item => {
    const code = codeMap.get(item.symbol) || '';
    const codeLength = code.length;
    const itemTotalBits = item.frequency * codeLength;
    totalTheoreticalBits += itemTotalBits;

    codeDetailsList.push({
      symbol: item.symbol,
      frequency: item.frequency,
      probability: item.probability,
      percentage: item.percentage,
      huffmanCode: code,
      codeLength: codeLength,
      totalBits: itemTotalBits,
      savingVsBaseline: (8 - codeLength) // Positive if shorter than 8 bits
    });
  });

  const averageCodeLength = totalPixels > 0 ? (totalTheoreticalBits / totalPixels).toFixed(4) : 0;
  const theoreticalCompressionRatio = totalTheoreticalBits > 0 ? (totalBitsOriginal / totalTheoreticalBits).toFixed(2) : 1;
  const theoreticalSpaceSavings = (((totalBitsOriginal - totalTheoreticalBits) / totalBitsOriginal) * 100).toFixed(2);

  return {
    codeDetailsList,
    averageCodeLength, // Average bits per pixel (L_avg)
    totalTheoreticalBits,
    totalBitsOriginal,
    theoreticalCompressionRatio,
    theoreticalSpaceSavings
  };
}

/**
 * TODO (PART 2): Compressed Bitstream Serializer
 * Takes the raw pixel array and codeMap to produce an actual compressed ArrayBuffer/Uint8Array.
 */
export function compressImageBitstream(grayscaleArray, codeMap) {
  console.log('TODO (PART 2): Huffman Bitstream encoder & binary packer will be implemented in Part 2.');
  return null;
}

/**
 * TODO (PART 2): Huffman Decompressor
 * Reads serialized header and bitstream to decode back into original grayscale pixel array.
 */
export function decompressImageBitstream(compressedBuffer, treeRoot) {
  console.log('TODO (PART 2): Huffman Decompression decoder will be implemented in Part 2.');
  return null;
}
