/**
 * Fullscreen overlay for annotation and form
 */

import { createSidebarHTML, initSidebarEvents, updateSelectedElements } from './sidebar.js';
import { collectMetadata } from './metadata.js';
import { createToolbarHTML, initToolbar, destroyToolbar } from './toolbar.js';
import { initCanvas, destroyCanvas, hasAnnotations, getCanvasDataURL } from './canvas.js';

let overlayElement = null;
let screenshotData = null;
let elementMapData = null;
let viewportData = null;
let metadataCache = null;
let onCloseCallback = null;
let onSubmitCallback = null;
let selectedElements = [];
let elementPickerActive = false;
let highlightOverlay = null;

/**
 * Show the overlay with captured screenshot
 * @param {Object} capture - { dataUrl, elementMap, viewport }
 * @param {Object} options - Options
 * @param {Function} options.onClose - Callback when overlay is closed
 * @param {Function} options.onSubmit - Callback when form is submitted
 */
export function showOverlay(capture, options = {}) {
  if (overlayElement) return;

  screenshotData = capture.dataUrl;
  elementMapData = capture.elementMap;
  viewportData = capture.viewport;
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
            <img class="blindspot-screenshot" src="${capture.dataUrl}" alt="Screenshot" />
            <canvas class="blindspot-drawing-canvas"></canvas>
            <div class="blindspot-selected-highlights"></div>
            <div class="blindspot-element-highlight-overlay"></div>
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
    // Initialize toolbar with tool change handler
    const toolbarContainer = overlayElement.querySelector('.blindspot-toolbar-tools');
    initToolbar(toolbarContainer, {
      onToolChange: handleToolChange,
    });

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
  deactivateScreenshotElementPicker();
  destroyToolbar();
  destroyCanvas();

  overlayElement.remove();
  overlayElement = null;
  screenshotData = null;
  elementMapData = null;
  viewportData = null;
  metadataCache = null;
  selectedElements = [];
  highlightOverlay = null;

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

function handleToolChange(tool) {
  if (tool === 'element') {
    // Activate element picker mode on screenshot
    activateScreenshotElementPicker();
  } else {
    // Deactivate if switching away from element tool
    deactivateScreenshotElementPicker();
  }
}

function activateScreenshotElementPicker() {
  elementPickerActive = true;
  const wrapper = overlayElement.querySelector('.blindspot-canvas-wrapper');
  const img = overlayElement.querySelector('.blindspot-screenshot');
  highlightOverlay = overlayElement.querySelector('.blindspot-element-highlight-overlay');

  // Style the highlight overlay to exactly match the image
  // Use offsetWidth/offsetHeight to get the displayed size
  const updateOverlaySize = () => {
    highlightOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: ${img.offsetWidth}px;
      height: ${img.offsetHeight}px;
      pointer-events: none;
      z-index: 10;
    `;
  };

  // Update size initially and on image load
  if (img.complete) {
    updateOverlaySize();
  }
  img.addEventListener('load', updateOverlaySize);

  // Add cursor style to wrapper
  wrapper.style.cursor = 'crosshair';

  // Add event listeners to wrapper
  wrapper.addEventListener('mousemove', handleScreenshotMouseMove);
  wrapper.addEventListener('click', handleScreenshotClick);

  // Show instruction
  showPickerInstruction();

  console.log('[Blindspot] Screenshot element picker activated');
}

function deactivateScreenshotElementPicker() {
  if (!elementPickerActive) return;
  elementPickerActive = false;

  const wrapper = overlayElement?.querySelector('.blindspot-canvas-wrapper');
  if (wrapper) {
    wrapper.style.cursor = '';
    wrapper.removeEventListener('mousemove', handleScreenshotMouseMove);
    wrapper.removeEventListener('click', handleScreenshotClick);
  }

  if (highlightOverlay) {
    highlightOverlay.innerHTML = '';
  }

  hidePickerInstruction();
  console.log('[Blindspot] Screenshot element picker deactivated');
}

function handleScreenshotMouseMove(e) {
  if (!elementPickerActive || !elementMapData) return;

  const img = overlayElement.querySelector('.blindspot-screenshot');
  const imgRect = img.getBoundingClientRect();

  // Check if mouse is over the image
  if (e.clientX < imgRect.left || e.clientX > imgRect.right ||
      e.clientY < imgRect.top || e.clientY > imgRect.bottom) {
    highlightOverlay.innerHTML = '';
    highlightOverlay.dataset.currentElement = '';
    return;
  }

  // Calculate scale from viewport coordinates to displayed image coordinates
  const scaleX = imgRect.width / viewportData.width;
  const scaleY = imgRect.height / viewportData.height;

  // Map mouse position to original viewport coordinates
  const x = (e.clientX - imgRect.left) / scaleX;
  const y = (e.clientY - imgRect.top) / scaleY;

  // Find element at this position (elementMap is sorted by area, smallest first)
  const element = elementMapData.find(el =>
    x >= el.rect.left && x <= el.rect.right &&
    y >= el.rect.top && y <= el.rect.bottom
  );

  if (element) {
    // Convert element coordinates to displayed pixels
    const displayLeft = element.rect.left * scaleX;
    const displayTop = element.rect.top * scaleY;
    const displayWidth = element.rect.width * scaleX;
    const displayHeight = element.rect.height * scaleY;

    // Build label with more context
    let label = element.tagName;
    if (element.id) label += `#${element.id}`;
    else if (element.classes.length) label += `.${element.classes[0]}`;
    if (element.text && element.text.length > 0) {
      label += ` "${element.text.substring(0, 30)}${element.text.length > 30 ? '...' : ''}"`;
    }

    // Calculate label position - above the highlight box
    const labelTop = Math.max(0, displayTop - 28);

    highlightOverlay.innerHTML = `
      <div style="
        position: absolute;
        left: ${displayLeft}px;
        top: ${displayTop}px;
        width: ${displayWidth}px;
        height: ${displayHeight}px;
        border: 3px solid #9B78F4;
        background: rgba(155, 120, 244, 0.15);
        border-radius: 4px;
        pointer-events: none;
        box-sizing: border-box;
      "></div>
      <div style="
        position: absolute;
        left: ${displayLeft}px;
        top: ${labelTop}px;
        background: #201E1D;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 12px;
        pointer-events: none;
        white-space: nowrap;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
      ">${label}</div>
    `;

    highlightOverlay.dataset.currentElement = JSON.stringify(element);
  } else {
    highlightOverlay.innerHTML = '';
    highlightOverlay.dataset.currentElement = '';
  }
}

function handleScreenshotClick(e) {
  if (!elementPickerActive || !highlightOverlay.dataset.currentElement) return;

  const element = JSON.parse(highlightOverlay.dataset.currentElement);
  // Pass all element data for AI debugging context
  handleElementSelected({
    selector: element.selector,
    fullSelector: element.fullSelector,
    tagName: element.tagName,
    id: element.id,
    classes: element.classes,
    text: element.text,
    dataAttributes: element.dataAttributes,
    accessibleName: element.accessibleName,
    context: element.context,
    rect: element.rect,
  });
}

let pickerInstructionEl = null;

function showPickerInstruction() {
  pickerInstructionEl = document.createElement('div');
  pickerInstructionEl.className = 'blindspot-picker-instruction';
  pickerInstructionEl.style.cssText = `
    position: fixed;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: #201E1D;
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  pickerInstructionEl.textContent = 'Click on an element to select it';
  document.body.appendChild(pickerInstructionEl);
}

function hidePickerInstruction() {
  if (pickerInstructionEl) {
    pickerInstructionEl.remove();
    pickerInstructionEl = null;
  }
}

function handleElementSelected(elementInfo) {
  // Check if element is already selected (by selector)
  const exists = selectedElements.some(el => el.selector === elementInfo.selector);
  if (!exists) {
    selectedElements.push(elementInfo);
    updateSelectedElements(selectedElements, handleRemoveElement);
    drawSelectedElementHighlights();
    console.log('[Blindspot] Element added:', elementInfo.selector);
  } else {
    console.log('[Blindspot] Element already selected:', elementInfo.selector);
  }
}

function handleRemoveElement(index) {
  selectedElements.splice(index, 1);
  updateSelectedElements(selectedElements, handleRemoveElement);
  drawSelectedElementHighlights();
  console.log('[Blindspot] Element removed, remaining:', selectedElements.length);
}

/**
 * Draw permanent highlight boxes for all selected elements
 */
function drawSelectedElementHighlights() {
  const container = overlayElement?.querySelector('.blindspot-selected-highlights');
  if (!container) return;

  const img = overlayElement.querySelector('.blindspot-screenshot');
  if (!img) return;

  const imgRect = img.getBoundingClientRect();
  const scaleX = imgRect.width / viewportData.width;
  const scaleY = imgRect.height / viewportData.height;

  let html = '';
  for (const el of selectedElements) {
    if (!el.rect) continue;

    const displayLeft = el.rect.left * scaleX;
    const displayTop = el.rect.top * scaleY;
    const displayWidth = el.rect.width * scaleX;
    const displayHeight = el.rect.height * scaleY;

    html += `
      <div style="
        position: absolute;
        left: ${displayLeft}px;
        top: ${displayTop}px;
        width: ${displayWidth}px;
        height: ${displayHeight}px;
        border: 3px solid #9B78F4;
        background: rgba(155, 120, 244, 0.15);
        border-radius: 4px;
        pointer-events: none;
        box-sizing: border-box;
      "></div>
    `;
  }

  container.innerHTML = html;
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
      elements: selectedElements,
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
