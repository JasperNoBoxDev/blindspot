/**
 * Form sidebar for bug report submission
 */

let onSubmitCallback = null;

/**
 * Create the sidebar HTML content
 * @param {Object} metadata - Auto-collected metadata
 * @param {Function} onSubmit - Callback when form is submitted
 * @returns {string} HTML string
 */
export function createSidebarHTML(metadata, onSubmit) {
  onSubmitCallback = onSubmit;

  return `
    <div class="blindspot-sidebar-content">
      <div class="blindspot-sidebar-header">
        <h2 class="blindspot-sidebar-title">Report Issue</h2>
      </div>

      <form class="blindspot-form" id="blindspot-form">
        <div class="blindspot-form-group">
          <label class="blindspot-label" for="blindspot-title">Title *</label>
          <input
            type="text"
            id="blindspot-title"
            class="blindspot-input"
            placeholder="Brief description of the issue"
            required
          />
        </div>

        <div class="blindspot-form-group">
          <label class="blindspot-label" for="blindspot-description">Description</label>
          <textarea
            id="blindspot-description"
            class="blindspot-textarea"
            placeholder="Steps to reproduce, expected behavior, etc."
            rows="4"
          ></textarea>
        </div>

        <div class="blindspot-form-group">
          <label class="blindspot-label" for="blindspot-reporter">Submitted by *</label>
          <input
            type="text"
            id="blindspot-reporter"
            class="blindspot-input"
            placeholder=""
            autocomplete="off"
            data-1p-ignore
            data-lpignore="true"
            required
          />
        </div>

        <div class="blindspot-form-group blindspot-elements-section" style="display: none;">
          <label class="blindspot-label">Selected Elements</label>
          <div class="blindspot-elements-list"></div>
        </div>

        <div class="blindspot-form-group">
          <label class="blindspot-label">Captured Info</label>
          <div class="blindspot-metadata">
            <div class="blindspot-metadata-item">
              <span class="blindspot-metadata-label">URL</span>
              <span class="blindspot-metadata-value" title="${metadata.url}">${truncate(metadata.url, 35)}</span>
            </div>
            <div class="blindspot-metadata-item">
              <span class="blindspot-metadata-label">Browser</span>
              <span class="blindspot-metadata-value">${metadata.browser}</span>
            </div>
            <div class="blindspot-metadata-item">
              <span class="blindspot-metadata-label">OS</span>
              <span class="blindspot-metadata-value">${metadata.os}</span>
            </div>
            <div class="blindspot-metadata-item">
              <span class="blindspot-metadata-label">Viewport</span>
              <span class="blindspot-metadata-value">${metadata.viewport}</span>
            </div>
          </div>
        </div>

        <button type="submit" class="blindspot-submit-btn">
          Submit Bug Report
        </button>
      </form>
    </div>
  `;
}

/**
 * Initialize sidebar event listeners
 */
export function initSidebarEvents() {
  const form = document.getElementById('blindspot-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
}

function handleSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('blindspot-title').value.trim();
  const description = document.getElementById('blindspot-description').value.trim();
  const reporter = document.getElementById('blindspot-reporter').value.trim();

  if (!title) {
    return;
  }

  console.log('[Blindspot] Form submitted', { title, description, reporter });

  if (onSubmitCallback) {
    onSubmitCallback({ title, description, reporter });
  }
}

function truncate(str, length) {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

/**
 * Update the selected elements display in the sidebar
 * @param {Array} elements - Array of element info objects
 * @param {Function} onRemove - Callback when element is removed, receives index
 */
export function updateSelectedElements(elements, onRemove) {
  const section = document.querySelector('.blindspot-elements-section');
  const list = document.querySelector('.blindspot-elements-list');

  if (!section || !list) return;

  if (elements.length === 0) {
    section.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  section.style.display = 'block';
  list.innerHTML = elements.map((el, index) => `
    <div class="blindspot-element-chip" data-index="${index}">
      <span class="blindspot-element-tag">${el.tagName}</span>
      <span class="blindspot-element-detail">${getElementLabel(el)}</span>
      <button type="button" class="blindspot-element-remove" data-index="${index}" aria-label="Remove">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `).join('');

  // Add remove handlers
  list.querySelectorAll('.blindspot-element-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const index = parseInt(btn.dataset.index, 10);
      if (onRemove) onRemove(index);
    });
  });
}

function getElementLabel(el) {
  let label = '';

  // Primary identifier
  if (el.id) {
    label = `#${el.id}`;
  } else if (el.classes && el.classes.length > 0) {
    label = `.${el.classes[0]}`;
  }

  // Add text context
  if (el.text && el.text.length > 0) {
    const textPreview = truncate(el.text, 25);
    label += label ? ` "${textPreview}"` : `"${textPreview}"`;
  } else if (el.innerText && el.innerText.length > 0) {
    const textPreview = truncate(el.innerText, 25);
    label += label ? ` "${textPreview}"` : `"${textPreview}"`;
  }

  return label || el.selector || el.tagName;
}
