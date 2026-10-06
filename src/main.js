/**
 * main.js — Application Entry Point
 * -------------------------------------------------------------
 * Imports global styles and boots the UI Controller module.
 * This is the top-level orchestrator for Part 1 of the project.
 *
 * Module Dependency Map:
 *   main.js
 *     └── uiController.js     (event handling, pipeline orchestration)
 *           ├── imageHandler.js      (load image, extract metadata)
 *           ├── preprocessor.js      (grayscale conversion, pixel matrix)
 *           ├── frequencyAnalyzer.js (frequency table, Shannon entropy)
 *           ├── huffmanTree.js       (HuffmanNode, PriorityQueue, tree builder, code generator)
 *           ├── huffmanVisualizer.js (SVG tree layout and render)
 *           └── sampleImages.js      (synthetic preset images)
 *
 * TODO (PART 2): Import and wire quadtreeCompressor.js and decompressor.js modules.
 */

import './style.css';
import { initApp } from './modules/uiController.js';

// Boot the application once the DOM is fully parsed
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
