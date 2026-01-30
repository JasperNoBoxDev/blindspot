/**
 * Annotation toolbar
 */

import { setTool, getTool, clearCanvas, undoLast } from './canvas.js';

let toolbarElement = null;
let activeButton = null;

// Tool icons (SVG)
const ICONS = {
  arrow: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>`,
  rectangle: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  </svg>`,
  text: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="4 7 4 4 20 4 20 7"/>
    <line x1="9" y1="20" x2="15" y2="20"/>
    <line x1="12" y1="4" x2="12" y2="20"/>
  </svg>`,
  draw: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
    <path d="M2 2l7.586 7.586"/>
    <circle cx="11" cy="11" r="2"/>
  </svg>`,
  undo: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 7v6h6"/>
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
  </svg>`,
  clear: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>`,
};

/**
 * Create toolbar HTML
 * @returns {string} HTML string
 */
export function createToolbarHTML() {
  return `
    <div class="blindspot-tool-group">
      <button class="blindspot-tool-btn active" data-tool="arrow" title="Arrow">
        ${ICONS.arrow}
      </button>
      <button class="blindspot-tool-btn" data-tool="rectangle" title="Box">
        ${ICONS.rectangle}
      </button>
      <button class="blindspot-tool-btn" data-tool="text" title="Text">
        ${ICONS.text}
      </button>
      <button class="blindspot-tool-btn" data-tool="draw" title="Freeform">
        ${ICONS.draw}
      </button>
    </div>
    <div class="blindspot-tool-divider"></div>
    <div class="blindspot-tool-group">
      <button class="blindspot-tool-btn" data-action="undo" title="Undo">
        ${ICONS.undo}
      </button>
      <button class="blindspot-tool-btn" data-action="clear" title="Clear all">
        ${ICONS.clear}
      </button>
    </div>
  `;
}

/**
 * Initialize toolbar event listeners
 * @param {HTMLElement} container - The toolbar container element
 */
export function initToolbar(container) {
  toolbarElement = container;

  // Tool buttons
  const toolBtns = container.querySelectorAll('[data-tool]');
  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.tool;
      setTool(tool);
      updateActiveButton(btn);
    });
  });

  // Action buttons
  const actionBtns = container.querySelectorAll('[data-action]');
  actionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'undo') {
        undoLast();
      } else if (action === 'clear') {
        clearCanvas();
      }
    });
  });

  // Set initial active button
  activeButton = container.querySelector('[data-tool="arrow"]');
}

function updateActiveButton(btn) {
  if (activeButton) {
    activeButton.classList.remove('active');
  }
  btn.classList.add('active');
  activeButton = btn;
}

/**
 * Cleanup toolbar
 */
export function destroyToolbar() {
  toolbarElement = null;
  activeButton = null;
}
