/**
 * Huffman Tree Visualizer Module - Part 1
 * -------------------------------------------------------------
 * Renders an interactive, SVG-based hierarchical representation of the Huffman Binary Tree.
 * Includes branch binary direction labels ('0' left, '1' right), depth/top-K controls,
 * and node detail popovers.
 */

/**
 * Calculates tree coordinates for visual layout using Reingold-Tilford algorithm principles.
 * @param {import('./huffmanTree.js').HuffmanNode} root 
 * @param {number} maxDepth - Max levels to visualize for clarity
 * @returns {Object} Tree structure with (x, y) coordinates
 */
export function layoutTree(root, maxDepth = 5) {
  if (!root) return null;

  let maxReachedDepth = 0;

  function calculatePositions(node, depth, x, xSpan) {
    if (!node) return null;
    if (depth > maxReachedDepth) maxReachedDepth = depth;

    const visualNode = {
      id: node.id,
      symbol: node.symbol,
      freq: node.freq,
      isLeaf: node.isLeaf(),
      depth,
      x,
      y: depth * 70 + 40,
      left: null,
      right: null
    };

    if (depth < maxDepth) {
      const nextSpan = xSpan / 2;
      if (node.left) {
        visualNode.left = calculatePositions(node.left, depth + 1, x - nextSpan, nextSpan);
      }
      if (node.right) {
        visualNode.right = calculatePositions(node.right, depth + 1, x + nextSpan, nextSpan);
      }
    }

    return visualNode;
  }

  // Initial width span for top root node
  const initialSpan = Math.max(300, Math.pow(2, Math.min(maxDepth, 6)) * 25);
  const layout = calculatePositions(root, 0, initialSpan + 50, initialSpan);

  return {
    root: layout,
    totalWidth: (initialSpan + 50) * 2,
    totalHeight: (maxDepth + 1) * 75 + 50,
    maxReachedDepth
  };
}

/**
 * Renders the SVG representation of the calculated tree layout.
 * @param {import('./huffmanTree.js').HuffmanNode} rootNode 
 * @param {HTMLElement} containerElement 
 * @param {number} maxDepth - Visualization level limit
 */
export function renderHuffmanTreeSVG(rootNode, containerElement, maxDepth = 5) {
  if (!containerElement) return;

  if (!rootNode) {
    containerElement.innerHTML = `
      <div class="empty-visualizer">
        <p>No Huffman tree data available. Please upload an image first.</p>
      </div>`;
    return;
  }

  const treeLayout = layoutTree(rootNode, maxDepth);
  if (!treeLayout || !treeLayout.root) return;

  const { root, totalWidth, totalHeight } = treeLayout;

  let svgContent = `<svg class="huffman-svg-tree" viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" height="${totalHeight}px" xmlns="http://www.w3.org/2000/svg">`;

  // Define SVG markers and gradients
  svgContent += `
    <defs>
      <linearGradient id="nodeGradLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#1d4ed8" />
      </linearGradient>
      <linearGradient id="nodeGradInternal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#334155" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  `;

  // Render connecting lines first (so they draw behind nodes)
  function renderEdges(node) {
    if (!node) return '';
    let edges = '';

    if (node.left) {
      edges += `
        <g class="tree-edge-group">
          <line x1="${node.x}" y1="${node.y}" x2="${node.left.x}" y2="${node.left.y}" class="tree-edge edge-0" />
          <rect x="${(node.x + node.left.x) / 2 - 10}" y="${(node.y + node.left.y) / 2 - 10}" width="20" height="18" rx="4" class="edge-bg" />
          <text x="${(node.x + node.left.x) / 2}" y="${(node.y + node.left.y) / 2 + 3}" class="edge-label label-0">0</text>
        </g>
      `;
      edges += renderEdges(node.left);
    }

    if (node.right) {
      edges += `
        <g class="tree-edge-group">
          <line x1="${node.x}" y1="${node.y}" x2="${node.right.x}" y2="${node.right.y}" class="tree-edge edge-1" />
          <rect x="${(node.x + node.right.x) / 2 - 10}" y="${(node.y + node.right.x) / 2 - 10}" width="20" height="18" rx="4" class="edge-bg" />
          <text x="${(node.x + node.right.x) / 2}" y="${(node.y + node.right.y) / 2 + 3}" class="edge-label label-1">1</text>
        </g>
      `;
      edges += renderEdges(node.right);
    }

    return edges;
  }

  // Render tree node circles and text labels
  function renderNodes(node) {
    if (!node) return '';
    let nodesHtml = '';

    const radius = node.isLeaf ? 22 : 18;
    const fillStyle = node.isLeaf ? 'url(#nodeGradLeaf)' : 'url(#nodeGradInternal)';
    const strokeStyle = node.isLeaf ? '#60a5fa' : '#64748b';

    const titleText = node.isLeaf 
      ? `Leaf Node | Intensity: ${node.symbol} | Frequency: ${node.freq}`
      : `Internal Node | Subtree Weight: ${node.freq}`;

    nodesHtml += `
      <g class="tree-node ${node.isLeaf ? 'leaf-node' : 'internal-node'}" data-title="${titleText}" transform="translate(${node.x}, ${node.y})">
        <circle r="${radius}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="2" class="node-circle" />
        <text y="${node.isLeaf ? -2 : 4}" class="node-text-freq">${node.freq}</text>
        ${node.isLeaf ? `<text y="10" class="node-text-symbol">Px ${node.symbol}</text>` : ''}
      </g>
    `;

    if (node.left) nodesHtml += renderNodes(node.left);
    if (node.right) nodesHtml += renderNodes(node.right);

    return nodesHtml;
  }

  svgContent += `<g class="tree-edges">${renderEdges(root)}</g>`;
  svgContent += `<g class="tree-nodes">${renderNodes(root)}</g>`;
  svgContent += `</svg>`;

  containerElement.innerHTML = `
    <div class="svg-viewport-wrapper">
      ${svgContent}
    </div>
  `;
}
