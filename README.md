# 🖼️ Interactive Image Compression & Huffman Visualization Suite

An interactive web application for analyzing, visualising, and compressing images using **Huffman Coding** and entropy analysis algorithms. Designed as an educational and functional tool to explore information theory, symbol frequency distribution, prefix-free binary trees, and spatial image representation.

---

## ✨ Features Implemented (Part 1)

### 📸 1. Image Ingestion & Preset Samples
- **Custom Image Upload**: Drag-and-drop or upload custom PNG, JPEG, and WebP images.
- **Preset Synthetic Test Patterns**: Built-in test samples including *Smooth Gradient*, *Checkerboard*, *Gaussian Noise*, and *Low Contrast* patterns to demonstrate varying entropy levels.
- **Image Metadata Extraction**: Real-time resolution (dimensions in pixels), aspect ratio, and total pixel count.

### ⚙️ 2. Image Preprocessing
- **Luminance Grayscale Conversion**: Converts RGB color images into standard grayscale pixel intensity matrices using the ITU-R BT.601 luminance formula ($Y = 0.299R + 0.587G + 0.114B$).
- **Pixel Intensity Matrix Extraction**: Formats 8-bit intensity values (0–255) for accurate frequency counting.

### 📊 3. Frequency Analysis & Information Theory
- **Interactive Intensity Histogram**: Visualized using Chart.js to inspect pixel frequency and probability distribution.
- **Shannon Entropy Calculation**: Computes the theoretical lower bound for lossless compression per pixel using Shannon's Entropy formula:
  $$H(X) = -\sum_{i=0}^{255} P(x_i) \log_2 P(x_i)$$
- **Entropy Metrics**: Displays theoretical minimum bits required vs. uncompressed 8-bit fixed length representation.

### 🌳 4. Huffman Coding Engine
- **Min-Priority Queue & Huffman Tree Construction**: Builds optimal prefix-free binary tree based on pixel symbol frequencies.
- **Variable-Length Code Generation**: Assigns binary bitstrings (`0`s and `1`s) to each 8-bit intensity value.
- **Compression Metrics**:
  - **Average Codeword Length ($\bar{L}$)**: $\sum P(x_i) \cdot \text{length}(\text{code}_i)$
  - **Theoretical Compression Ratio**: $\frac{8}{\bar{L}}$
  - **Estimated Bit Savings (%)**: Percentage reduction in storage size compared to 8 bits/pixel.

### 🔍 5. Interactive Huffman Tree Visualizer
- **Dynamic SVG Tree Rendering**: Renders full or pruned view of the generated binary tree structure.
- **Visual Node Classification**: Highlights leaf nodes (symbol values & frequencies) and internal nodes (combined weights).
- **Interactive Controls**: Zooming, panning, and hover tooltips for step-by-step tree inspection.

---

## 🛠️ Technology Stack

- **Frontend Core**: JavaScript (ES6+ Modules), HTML5 Canvas, SVG
- **Styling**: Vanilla CSS (Modern CSS variables, Flexbox/Grid, Dark UI theme)
- **Build Tool**: Vite
- **Libraries**:
  - `Chart.js`: Dynamic histogram visualizer
  - `Lucide Icons`: Modern SVG UI icons

---

## 🚀 Quick Start & Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- `npm` package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/AnjneyShah21/Image-Compression.git

# Navigate into project directory
cd Image-Compression

# Install dependencies
npm install
```

### Running Locally

```bash
# Start Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

### Production Build

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

## 📋 What is Left / Remaining Work (TODO List)

The following features and modules are planned for **Part 2** and future development phases:

### 1. 💾 Bit-Level Binary Encoder & File Exporter
- [ ] Implement a true bitstream encoder (`huffmanEncoder.js`) that packs variable-length bitstrings into binary `Uint8Array` byte buffers.
- [ ] Design a custom binary container file format (`.huff` or `.imgc`) containing:
  - Header: Image dimensions, color mode, and serialized Huffman tree/frequency table.
  - Payload: Bit-packed Huffman codeword sequence.
- [ ] Add direct download functionality for the compressed binary file.

### 2. 🔓 Binary Decoder & Image Reconstruction
- [ ] Implement a full bitstream decoder (`huffmanDecoder.js`).
- [ ] Reconstruct the Huffman tree from the file header.
- [ ] Traverse the bitstream bit-by-bit to decode symbols and rebuild the original pixel array on HTML5 Canvas.
- [ ] Calculate and display MSE (Mean Squared Error) & PSNR (Peak Signal-to-Noise Ratio) to verify lossless reconstruction fidelity.

### 3. 🧩 Quadtree Spatial Compression Engine
- [ ] Implement `quadtreeCompressor.js` for spatial region-based image compression.
- [ ] Recursive quadrant partitioning based on color/intensity variance thresholds.
- [ ] Interactive threshold slider allowing user to balance compression ratio vs. visual quality (lossy compression mode).
- [ ] Visual overlay showing Quadtree bounding boxes over the original image.

### 4. 🎨 Full Color Channel Support (RGB / YCbCr)
- [ ] Extend Huffman coding across 3 separate channels ($R, G, B$) or $Y, C_b, C_r$ color spaces.
- [ ] Chroma subsampling ($4:2:0$ / $4:2:2$) demonstration for JPEG-like compression pipelines.

### 5. ⚡ Web Worker & Performance Optimizations
- [ ] Offload heavy tree construction and bit packing tasks to background Web Workers (`worker.js`) to keep the main UI smooth on high-resolution images ($4K+$).
- [ ] Add processing time benchmarks (Execution time in ms for analysis, encoding, and decoding).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
