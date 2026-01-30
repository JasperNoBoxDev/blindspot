/**
 * Blindspot - Bug reporting widget
 */

import { injectStyles } from './styles.js';
import { createTrigger, hideTrigger, showTrigger } from './trigger.js';
import { captureScreenshot } from './capture.js';
import { showOverlay, hideOverlay } from './overlay.js';

const config = {
  repo: null,
  workerUrl: null,
};

function init(options = {}) {
  if (!options.repo) {
    console.error('[Blindspot] Missing required option: repo');
    return;
  }
  if (!options.workerUrl) {
    console.error('[Blindspot] Missing required option: workerUrl');
    return;
  }

  config.repo = options.repo;
  config.workerUrl = options.workerUrl;

  // Inject styles
  injectStyles();

  // Create trigger button
  createTrigger(handleTrigger);

  console.log('[Blindspot] Initialized', { repo: config.repo });
}

async function handleTrigger() {
  console.log('[Blindspot] Starting capture mode...');

  try {
    hideTrigger();
    const screenshot = await captureScreenshot();
    console.log('[Blindspot] Screenshot ready, opening overlay...');
    showOverlay(screenshot, {
      onClose: () => {
        showTrigger();
      },
      onSubmit: handleSubmit,
    });
  } catch (error) {
    console.error('[Blindspot] Capture failed:', error);
    showTrigger();
  }
}

async function handleSubmit(data) {
  console.log('[Blindspot] Submitting report...', data);

  // Show loading state
  const submitBtn = document.querySelector('.blindspot-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }

  try {
    const response = await fetch(`${config.workerUrl}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        reporter: data.reporter,
        screenshot: data.screenshot,
        metadata: data.metadata,
        repo: config.repo,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit report');
    }

    console.log('[Blindspot] Report submitted successfully:', result);

    // Show success message
    showSuccessMessage(result.issueUrl);

  } catch (error) {
    console.error('[Blindspot] Submit failed:', error);
    alert(`Failed to submit report: ${error.message}`);

    // Reset button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Bug Report';
    }
  }
}

function showSuccessMessage(issueUrl) {
  const sidebar = document.querySelector('.blindspot-sidebar-content');
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="blindspot-success">
        <div class="blindspot-success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h3 class="blindspot-success-title">Report Submitted!</h3>
        <p class="blindspot-success-text">Your bug report has been created successfully.</p>
        ${issueUrl ? `<a href="${issueUrl}" target="_blank" class="blindspot-success-link">View Issue on GitHub</a>` : ''}
        <button class="blindspot-close-overlay-btn" onclick="document.querySelector('.blindspot-close-btn').click()">Close</button>
      </div>
    `;
  }
}

export { init };
