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

export function createTrigger(onTrigger) {
  if (triggerButton) return triggerButton;

  onTriggerCallback = onTrigger;

  triggerButton = document.createElement('button');
  triggerButton.className = 'blindspot-trigger';
  triggerButton.innerHTML = `
    ${CLIP_ICON}
    <span class="blindspot-trigger-text">Report issue</span>
    <span class="blindspot-trigger-dots">
      <span></span>
      <span></span>
      <span></span>
    </span>
  `;
  triggerButton.setAttribute('aria-label', 'Report a bug');

  triggerButton.addEventListener('click', handleClick);

  document.body.appendChild(triggerButton);
  return triggerButton;
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
