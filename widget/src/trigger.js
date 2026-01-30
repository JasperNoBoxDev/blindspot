/**
 * Trigger button - side tab on right edge
 */

// Paperclip/attachment icon SVG
const CLIP_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
</svg>
`;

let triggerButton = null;
let onTriggerCallback = null;

export function createTrigger(onTrigger, options = {}) {
  if (triggerButton) return triggerButton;

  onTriggerCallback = onTrigger;

  const color = options.color || '#FE795D';
  const text = options.text || 'Report issue';

  triggerButton = document.createElement('button');
  triggerButton.className = 'blindspot-trigger';
  triggerButton.innerHTML = `
    ${CLIP_ICON}
    <span class="blindspot-trigger-text">${text}</span>
    <span class="blindspot-trigger-dots">
      <span></span>
      <span></span>
      <span></span>
    </span>
  `;
  triggerButton.setAttribute('aria-label', text);

  // Apply custom color
  triggerButton.style.background = color;
  triggerButton.dataset.color = color;

  triggerButton.addEventListener('click', handleClick);

  document.body.appendChild(triggerButton);
  return triggerButton;
}

function darkenColor(hex, percent) {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Darken
  r = Math.max(0, Math.floor(r * (100 - percent) / 100));
  g = Math.max(0, Math.floor(g * (100 - percent) / 100));
  b = Math.max(0, Math.floor(b * (100 - percent) / 100));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function handleClick() {
  console.log('[Blindspot] Trigger clicked');
  if (onTriggerCallback) {
    onTriggerCallback();
  }
}

export function hideTrigger() {
  if (triggerButton) {
    triggerButton.style.display = 'none';
  }
}

export function showTrigger() {
  if (triggerButton) {
    triggerButton.style.display = 'flex';
  }
}
