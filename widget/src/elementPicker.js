/**
 * Element picker mode - lets users select DOM elements
 */

import { extractElementInfo } from './elements.js';
import { selectTool } from './toolbar.js';

let isActive = false;
let overlayElement = null;
let highlightBox = null;
let instructionBanner = null;
let tooltip = null;
let hoveredElement = null;
let elementAtPoint = null; // The raw element from elementFromPoint
let onElementSelected = null;

const HIGHLIGHT_COLOR = '#9B78F4'; // Purple from brand

/**
 * Activate element picker mode
 * @param {HTMLElement} overlay - The overlay element to hide during detection
 * @param {Function} onSelect - Callback when element is selected, receives element info
 */
export function activateElementPicker(overlay, onSelect) {
  if (isActive) return;

  isActive = true;
  overlayElement = overlay;
  onElementSelected = onSelect;

  // Create highlight box
  createHighlightBox();

  // Create instruction banner
  createInstructionBanner();

  // Create tooltip
  createTooltip();

  // Add event listeners to document
  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('wheel', handleWheel, { passive: false, capture: true });

  // Change cursor on overlay
  if (overlayElement) {
    overlayElement.style.cursor = 'crosshair';
  }

  console.log('[Blindspot] Element picker activated');
}

/**
 * Deactivate element picker mode
 */
export function deactivateElementPicker() {
  if (!isActive) return;

  isActive = false;

  // Remove event listeners
  document.removeEventListener('mousemove', handleMouseMove, true);
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('keydown', handleKeyDown, true);
  document.removeEventListener('wheel', handleWheel, { capture: true });

  // Remove highlight box
  if (highlightBox) {
    highlightBox.remove();
    highlightBox = null;
  }

  // Remove instruction banner
  if (instructionBanner) {
    instructionBanner.remove();
    instructionBanner = null;
  }

  // Remove tooltip
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }

  elementAtPoint = null;

  // Reset cursor
  if (overlayElement) {
    overlayElement.style.cursor = '';
  }

  hoveredElement = null;
  overlayElement = null;
  onElementSelected = null;

  console.log('[Blindspot] Element picker deactivated');
}

/**
 * Check if element picker is active
 */
export function isElementPickerActive() {
  return isActive;
}

function createHighlightBox() {
  highlightBox = document.createElement('div');
  highlightBox.className = 'blindspot-element-highlight';
  highlightBox.style.cssText = `
    position: fixed;
    pointer-events: none;
    border: 3px solid ${HIGHLIGHT_COLOR};
    background: ${HIGHLIGHT_COLOR}20;
    border-radius: 4px;
    z-index: 2147483646;
    display: none;
    transition: all 0.1s ease-out;
  `;
  document.body.appendChild(highlightBox);
}

function createInstructionBanner() {
  instructionBanner = document.createElement('div');
  instructionBanner.className = 'blindspot-picker-banner';
  instructionBanner.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #201E1D;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: none;
  `;
  instructionBanner.innerHTML = `
    <span>Click to select</span>
    <span style="opacity: 0.6; font-size: 12px;">Scroll to change • ESC to cancel</span>
  `;
  document.body.appendChild(instructionBanner);
}

function createTooltip() {
  tooltip = document.createElement('div');
  tooltip.className = 'blindspot-picker-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    background: #201E1D;
    color: white;
    padding: 6px 10px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    z-index: 2147483647;
    pointer-events: none;
    display: none;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(tooltip);
}

function handleMouseMove(e) {
  if (!isActive || !overlayElement) return;

  // Hide overlay to detect elements underneath
  const originalDisplay = overlayElement.style.display;
  overlayElement.style.display = 'none';

  // Get all elements at this point (sorted by z-order, topmost first)
  const elements = document.elementsFromPoint(e.clientX, e.clientY);

  // Restore overlay
  overlayElement.style.display = originalDisplay;

  // Filter to get non-blindspot elements
  const validElements = elements.filter(el => !isBlindspotElement(el) && el !== document.body && el !== document.documentElement);

  // Debug: log first few elements
  if (validElements.length > 0) {
    console.log('[Blindspot] Elements at point:', validElements.slice(0, 5).map(el => el.tagName + (el.className ? '.' + el.className.split(' ')[0] : '')));
  }

  // Find the first (topmost) valid element
  const element = validElements[0];

  if (element) {
    elementAtPoint = element;

    if (element !== hoveredElement) {
      hoveredElement = element;
      updateHighlight(hoveredElement);
      updateTooltip(hoveredElement, e.clientX, e.clientY);
    } else {
      updateTooltip(hoveredElement, e.clientX, e.clientY);
    }
  } else {
    hoveredElement = null;
    elementAtPoint = null;
    hideHighlight();
    hideTooltip();
  }
}

function handleWheel(e) {
  if (!isActive || !hoveredElement) return;

  e.preventDefault();
  e.stopPropagation();

  if (e.deltaY < 0) {
    // Scroll up = go to parent
    const parent = hoveredElement.parentElement;
    if (parent && parent !== document.body && parent !== document.documentElement && !isBlindspotElement(parent)) {
      hoveredElement = parent;
      updateHighlight(hoveredElement);
      updateTooltip(hoveredElement, e.clientX, e.clientY);
    }
  } else {
    // Scroll down = go to child (first child that contains the point)
    const rect = hoveredElement.getBoundingClientRect();
    for (const child of hoveredElement.children) {
      if (isBlindspotElement(child)) continue;
      const childRect = child.getBoundingClientRect();
      if (e.clientX >= childRect.left && e.clientX <= childRect.right &&
          e.clientY >= childRect.top && e.clientY <= childRect.bottom) {
        hoveredElement = child;
        updateHighlight(hoveredElement);
        updateTooltip(hoveredElement, e.clientX, e.clientY);
        break;
      }
    }
  }
}


function handleClick(e) {
  if (!isActive) return;

  // Prevent click from propagating
  e.preventDefault();
  e.stopPropagation();

  if (hoveredElement && !isBlindspotElement(hoveredElement)) {
    // Extract element info
    const elementInfo = extractElementInfo(hoveredElement);

    if (elementInfo && onElementSelected) {
      console.log('[Blindspot] Element selected:', elementInfo);
      onElementSelected(elementInfo);
    }

    // Deactivate picker and switch back to arrow tool
    deactivateElementPicker();
    selectTool('arrow');
  }
}

function handleKeyDown(e) {
  if (!isActive) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    deactivateElementPicker();
    selectTool('arrow');
  }
}

function updateHighlight(element) {
  if (!highlightBox) return;

  const rect = element.getBoundingClientRect();

  highlightBox.style.left = `${rect.left - 3}px`;
  highlightBox.style.top = `${rect.top - 3}px`;
  highlightBox.style.width = `${rect.width + 6}px`;
  highlightBox.style.height = `${rect.height + 6}px`;
  highlightBox.style.display = 'block';
}

function hideHighlight() {
  if (highlightBox) {
    highlightBox.style.display = 'none';
  }
}

function updateTooltip(element, mouseX, mouseY) {
  if (!tooltip) return;

  // Build element descriptor
  let descriptor = element.tagName.toLowerCase();
  if (element.id) {
    descriptor += `#${element.id}`;
  } else if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter(c => c && !c.startsWith('blindspot-')).slice(0, 2);
    if (classes.length > 0) {
      descriptor += `.${classes.join('.')}`;
    }
  }

  // Add dimensions
  const rect = element.getBoundingClientRect();
  descriptor += ` (${Math.round(rect.width)}×${Math.round(rect.height)})`;

  tooltip.textContent = descriptor;

  // Position tooltip near cursor but not overlapping
  const tooltipRect = tooltip.getBoundingClientRect();
  let left = mouseX + 15;
  let top = mouseY + 15;

  // Keep on screen
  if (left + 200 > window.innerWidth) {
    left = mouseX - 200;
  }
  if (top + 30 > window.innerHeight) {
    top = mouseY - 30;
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.display = 'block';
}

function hideTooltip() {
  if (tooltip) {
    tooltip.style.display = 'none';
  }
}

function isBlindspotElement(element) {
  // Check if element is part of Blindspot UI
  return element.closest('.blindspot-overlay') ||
         element.closest('.blindspot-element-highlight') ||
         element.closest('.blindspot-picker-banner') ||
         element.closest('.blindspot-picker-tooltip');
}
