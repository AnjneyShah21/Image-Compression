/**
 * UI Controller Module - Part 1
 * -------------------------------------------------------------
 * Coordinates user events, module data flow, UI rendering, Chart.js histogram,
 * data tables, and tree visualizers.
 */

import { loadImageSource } from './imageHandler.js';
import { convertToGrayscale } from './preprocessor.js';
import { analyzeFrequencies } from './frequencyAnalyzer.js';
import { buildHuffmanTree, generateHuffmanCodes, calculateHuffmanStats } from './huffmanTree.js';
import { renderHuffmanTreeSVG } from './huffmanVisualizer.js';
import { generateSampleImageDataUrl } from './sampleImages.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

let histogramChartInstance = null;
let currentProcessedData = null;
let codeTableSearchTerm = '';
let codeTablePage = 1;
const CODE_TABLE_PAGE_SIZE = 12;

/**
 * Initializes all event listeners and default UI states.
 */
export function initApp() {
  setupEventListeners();
  // Load initial preset image automatically so user sees immediate results
  loadSampleImage('gradient');
}

/**
 * Attaches DOM event listeners for file upload, sample buttons, sliders, search, and tab controls.
 */
function setupEventListeners() {
  const fileInput = document.getElementById('imageFileInput');
  const dropZone = document.getElementById('dropZone');

  // File Upload Handlers
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleImageFile(file);
    });
  }

  // Drag and Drop
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drop-active');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drop-active');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drop-active');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    });

    dropZone.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });
  }

  // Preset Sample Image Buttons
  document.querySelectorAll('.btn-sample').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sampleType = e.currentTarget.dataset.sample;
      loadSampleImage(sampleType);
    });
  });

  // Tree Depth Control Slider / Selector
  const depthControl = document.getElementById('treeDepthControl');
  if (depthControl) {
    depthControl.addEventListener('change', (e) => {
      const depth = parseInt(e.target.value, 10);
      if (currentProcessedData && currentProcessedData.huffmanRoot) {
        renderHuffmanTreeSVG(
          currentProcessedData.huffmanRoot,
          document.getElementById('treeSvgContainer'),
          depth
        );
      }
    });
  }

  // Search Filter for Huffman Table
  const tableSearchInput = document.getElementById('tableSearchInput');
  if (tableSearchInput) {
    tableSearchInput.addEventListener('input', (e) => {
      codeTableSearchTerm = e.target.value.trim().toLowerCase();
      codeTablePage = 1;
      renderCodeTable();
    });
  }
}

/**
 * Handles uploaded Image File
 * @param {File} file 
 */
async function handleImageFile(file) {
  try {
    showLoading(true);
    const loadedData = await loadImageSource(file, file.name);
    await processAndRenderImage(loadedData);
  } catch (err) {
    alert(err.message || 'Error loading image file');
  } finally {
    showLoading(false);
  }
}

/**
 * Loads a synthetic preset sample image
 * @param {'gradient' | 'checkerboard' | 'shapes'} sampleType 
 */
async function loadSampleImage(sampleType) {
  try {
    showLoading(true);
    const dataUrl = generateSampleImageDataUrl(sampleType, 160, 160);
    const loadedData = await loadImageSource(dataUrl, `sample_${sampleType}.png`);
    await processAndRenderImage(loadedData);
  } catch (err) {
    console.error(err);
  } finally {
    showLoading(false);
  }
}

/**
 * Core Part 1 Pipeline Execution:
 * 1. Read metadata
 * 2. Convert to Grayscale
 * 3. Analyze Frequency Distribution & Entropy
 * 4. Build Huffman Tree & Generate Codes
 * 5. Render SVG Tree and Histogram
 * @param {Object} imageInfo 
 */
async function processAndRenderImage(imageInfo) {
  // 1. Update basic image info in UI
  document.getElementById('infoFileName').textContent = imageInfo.fileName;
  document.getElementById('infoDimensions').textContent = `${imageInfo.width} × ${imageInfo.height} px`;
  document.getElementById('infoFormat').textContent = imageInfo.mimeType;
  document.getElementById('infoTotalPixels').textContent = imageInfo.totalPixels.toLocaleString();
  document.getElementById('infoFileSize').textContent = imageInfo.formattedSize;

  // Render Original Image preview
  const origPreview = document.getElementById('originalImagePreview');
  origPreview.src = imageInfo.src;

  // 2. Preprocessing: Convert to Grayscale
  const grayscaleResult = convertToGrayscale(imageInfo.imageData, imageInfo.width, imageInfo.height);
  const grayPreview = document.getElementById('grayscaleImagePreview');
  grayPreview.src = grayscaleResult.grayscaleDataUrl;

  // 3. Frequency & Entropy Analysis
  const freqAnalysis = analyzeFrequencies(grayscaleResult.grayscaleArray);

  document.getElementById('statTotalPixels').textContent = freqAnalysis.totalPixels.toLocaleString();
  document.getElementById('statUniqueSymbols').textContent = freqAnalysis.uniqueSymbolsCount;
  document.getElementById('statMinMaxIntensity').textContent = `${freqAnalysis.minIntensity} - ${freqAnalysis.maxIntensity}`;
  document.getElementById('statAvgIntensity').textContent = freqAnalysis.avgIntensity;
  document.getElementById('statEntropy').textContent = `${freqAnalysis.entropy} bits/px`;

  // 4. Huffman Tree & Codes Construction
  const huffmanRoot = buildHuffmanTree(freqAnalysis.frequencyTable);
  const codeMap = generateHuffmanCodes(huffmanRoot);
  const huffmanStats = calculateHuffmanStats(freqAnalysis.frequencyTable, codeMap, freqAnalysis.totalPixels);

  // Update Huffman Theoretical Stats UI
  document.getElementById('statAvgCodeLength').textContent = `${huffmanStats.averageCodeLength} bits/px`;
  document.getElementById('statTheoreticalRatio').textContent = `${huffmanStats.theoreticalCompressionRatio} : 1`;
  document.getElementById('statSpaceSavings').textContent = `${huffmanStats.theoreticalSpaceSavings}%`;
  document.getElementById('statRawBitSize').textContent = `${(freqAnalysis.rawBitSize / 8).toLocaleString()} Bytes`;
  document.getElementById('statHuffmanBitSize').textContent = `${(Math.ceil(huffmanStats.totalTheoreticalBits / 8)).toLocaleString()} Bytes`;

  // Store processed state
  currentProcessedData = {
    imageInfo,
    grayscaleResult,
    freqAnalysis,
    huffmanRoot,
    codeMap,
    huffmanStats
  };

  // 5. Render Frequency Histogram Chart
  renderHistogramChart(freqAnalysis.freqMap);

  // 6. Render Huffman Code & Frequency Table
  codeTablePage = 1;
  renderCodeTable();

  // 7. Render Huffman Tree SVG
  const depthControl = document.getElementById('treeDepthControl');
  const depth = depthControl ? parseInt(depthControl.value, 10) : 5;
  renderHuffmanTreeSVG(huffmanRoot, document.getElementById('treeSvgContainer'), depth);
}

/**
 * Renders the pixel intensity histogram using Chart.js
 * @param {number[]} freqMap - Array of length 256
 */
function renderHistogramChart(freqMap) {
  const canvas = document.getElementById('histogramChartCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  if (histogramChartInstance) {
    histogramChartInstance.destroy();
  }

  const labels = Array.from({ length: 256 }, (_, i) => i.toString());

  histogramChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Pixel Frequency',
        data: freqMap,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        barPercentage: 1.0,
        categoryPercentage: 1.0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Pixel Intensity (0 = Black, 255 = White)', color: '#94a3b8' },
          grid: { display: false },
          ticks: { color: '#64748b', maxTicksLimit: 16 }
        },
        y: {
          title: { display: true, text: 'Frequency (Count)', color: '#94a3b8' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => `Intensity Level: ${items[0].label}`,
            label: (item) => `Occurrences: ${item.raw.toLocaleString()} pixels`
          }
        }
      }
    }
  });
}

/**
 * Renders the Huffman Code & Frequency table with pagination and search.
 */
function renderCodeTable() {
  const tbody = document.getElementById('huffmanCodeTableBody');
  const paginationControls = document.getElementById('tablePaginationControls');
  if (!tbody || !currentProcessedData) return;

  const { codeDetailsList } = currentProcessedData.huffmanStats;

  // Filter based on search term
  let filtered = codeDetailsList;
  if (codeTableSearchTerm) {
    filtered = codeDetailsList.filter(item => {
      return (
        item.symbol.toString().includes(codeTableSearchTerm) ||
        item.huffmanCode.includes(codeTableSearchTerm)
      );
    });
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / CODE_TABLE_PAGE_SIZE) || 1;
  if (codeTablePage > totalPages) codeTablePage = totalPages;

  const startIndex = (codeTablePage - 1) * CODE_TABLE_PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + CODE_TABLE_PAGE_SIZE);

  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">No matching symbols found.</td></tr>`;
  } else {
    tbody.innerHTML = pageItems.map(item => `
      <tr>
        <td>
          <div class="symbol-chip">
            <span class="color-swatch" style="background-color: rgb(${item.symbol},${item.symbol},${item.symbol});"></span>
            <strong>${item.symbol}</strong>
          </div>
        </td>
        <td>${item.frequency.toLocaleString()}</td>
        <td>${(item.probability).toFixed(5)}</td>
        <td>${item.percentage}%</td>
        <td><code class="code-badge">${item.huffmanCode}</code></td>
        <td><span class="badge-length">${item.codeLength} bits</span></td>
        <td>${item.totalBits.toLocaleString()} bits</td>
      </tr>
    `).join('');
  }

  // Render pagination controls
  if (paginationControls) {
    paginationControls.innerHTML = `
      <div class="pagination-info">Showing ${startIndex + 1} - ${Math.min(startIndex + CODE_TABLE_PAGE_SIZE, totalItems)} of ${totalItems} symbols</div>
      <div class="pagination-buttons">
        <button class="btn-page" ${codeTablePage <= 1 ? 'disabled' : ''} id="btnPrevPage">Previous</button>
        <span class="page-indicator">Page ${codeTablePage} of ${totalPages}</span>
        <button class="btn-page" ${codeTablePage >= totalPages ? 'disabled' : ''} id="btnNextPage">Next</button>
      </div>
    `;

    document.getElementById('btnPrevPage')?.addEventListener('click', () => {
      if (codeTablePage > 1) {
        codeTablePage--;
        renderCodeTable();
      }
    });

    document.getElementById('btnNextPage')?.addEventListener('click', () => {
      if (codeTablePage < totalPages) {
        codeTablePage++;
        renderCodeTable();
      }
    });
  }
}

/**
 * Toggles overlay loading screen
 * @param {boolean} show 
 */
function showLoading(show) {
  const loader = document.getElementById('appLoadingOverlay');
  if (loader) {
    if (show) loader.classList.remove('hidden');
    else loader.classList.add('hidden');
  }
}
