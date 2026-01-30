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
          <label class="blindspot-label" for="blindspot-reporter">Submitted by</label>
          <input
            type="text"
            id="blindspot-reporter"
            class="blindspot-input"
            placeholder="Your name or email (optional)"
          />
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
