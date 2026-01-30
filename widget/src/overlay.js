/**
 * Fullscreen overlay for annotation and form
 */

import { createSidebarHTML, initSidebarEvents } from './sidebar.js';
import { collectMetadata } from './metadata.js';
import { createToolbarHTML, initToolbar, destroyToolbar } from './toolbar.js';
import { initCanvas, destroyCanvas, hasAnnotations, getCanvasDataURL } from './canvas.js';

let overlayElement = null;
let screenshotData = null;
let metadataCache = null;
let onCloseCallback = null;
let onSubmitCallback = null;

/**
 * Show the overlay with captured screenshot
 * @param {string} screenshot - Base64 PNG data URL
 * @param {Object} options - Options
 * @param {Function} options.onClose - Callback when overlay is closed
 * @param {Function} options.onSubmit - Callback when form is submitted
 */
export function showOverlay(screenshot, options = {}) {
  if (overlayElement) return;

  screenshotData = screenshot;
  onCloseCallback = options.onClose;
  onSubmitCallback = options.onSubmit;

  // Collect metadata
  metadataCache = collectMetadata();

  overlayElement = document.createElement('div');
  overlayElement.className = 'blindspot-overlay';
  overlayElement.innerHTML = `
    <div class="blindspot-overlay-backdrop"></div>
    <div class="blindspot-overlay-content">
      <div class="blindspot-toolbar">
        <div class="blindspot-toolbar-tools">
          ${createToolbarHTML()}
        </div>
        <button class="blindspot-close-btn" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="blindspot-main">
        <div class="blindspot-canvas-area">
          <div class="blindspot-canvas-wrapper">
            <img class="blindspot-screenshot" src="${screenshot}" alt="Screenshot" />
            <canvas class="blindspot-drawing-canvas"></canvas>
          </div>
        </div>
        <div class="blindspot-sidebar">
          ${createSidebarHTML(metadataCache, handleFormSubmit)}
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  overlayElement.querySelector('.blindspot-close-btn').addEventListener('click', hideOverlay);
  overlayElement.querySelector('.blindspot-overlay-backdrop').addEventListener('click', hideOverlay);

  // Handle escape key
  document.addEventListener('keydown', handleKeyDown);

  document.body.appendChild(overlayElement);
  document.body.style.overflow = 'hidden';

  // Initialize components after DOM is ready
  setTimeout(() => {
    // Initialize toolbar
    const toolbarContainer = overlayElement.querySelector('.blindspot-toolbar-tools');
    initToolbar(toolbarContainer);

    // Initialize canvas after image loads
    const img = overlayElement.querySelector('.blindspot-screenshot');
    const canvas = overlayElement.querySelector('.blindspot-drawing-canvas');

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      initCanvas(canvas);
    };

    // If image is already loaded (cached)
    if (img.complete) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      initCanvas(canvas);
    }

    // Initialize sidebar form events
    initSidebarEvents();
  }, 0);

  console.log('[Blindspot] Overlay opened');
}

/**
 * Hide and remove the overlay
 */
export function hideOverlay() {
  if (!overlayElement) return;

  document.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';

  // Cleanup components
  destroyToolbar();
  destroyCanvas();

  overlayElement.remove();
  overlayElement = null;
  screenshotData = null;
  metadataCache = null;

  if (onCloseCallback) {
    onCloseCallback();
    onCloseCallback = null;
  }

  console.log('[Blindspot] Overlay closed');
}

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    hideOverlay();
  }
}

function handleFormSubmit(formData) {
  if (onSubmitCallback) {
    // Merge screenshot with annotations if any
    let finalScreenshot = screenshotData;

    if (hasAnnotations()) {
      finalScreenshot = mergeScreenshotWithAnnotations();
    }

    onSubmitCallback({
      ...formData,
      screenshot: finalScreenshot,
      metadata: metadataCache,
    });
  }
}

/**
 * Merge the screenshot with drawn annotations
 */
function mergeScreenshotWithAnnotations() {
  const img = overlayElement.querySelector('.blindspot-screenshot');
  const drawingCanvas = overlayElement.querySelector('.blindspot-drawing-canvas');

  // Create a new canvas for merging
  const mergeCanvas = document.createElement('canvas');
  mergeCanvas.width = img.naturalWidth;
  mergeCanvas.height = img.naturalHeight;
  const ctx = mergeCanvas.getContext('2d');

  // Draw screenshot
  ctx.drawImage(img, 0, 0);

  // Draw annotations on top
  ctx.drawImage(drawingCanvas, 0, 0);

  return mergeCanvas.toDataURL('image/png');
}

/**
 * Get the current screenshot data
 */
export function getScreenshotData() {
  return screenshotData;
}

/**
 * Get the current metadata
 */
export function getMetadata() {
  return metadataCache;
}
