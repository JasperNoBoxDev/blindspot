/**
 * Screenshot capture using html2canvas
 */

const HTML2CANVAS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';

let html2canvasLoaded = false;

/**
 * Load html2canvas library dynamically
 */
function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    if (html2canvasLoaded && window.html2canvas) {
      resolve(window.html2canvas);
      return;
    }

    const script = document.createElement('script');
    script.src = HTML2CANVAS_URL;
    script.onload = () => {
      html2canvasLoaded = true;
      console.log('[Blindspot] html2canvas loaded');
      resolve(window.html2canvas);
    };
    script.onerror = () => {
      reject(new Error('Failed to load html2canvas'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Capture screenshot of the current viewport
 * @returns {Promise<string>} Base64 PNG data URL
 */
export async function captureScreenshot() {
  console.log('[Blindspot] Capturing screenshot...');

  const html2canvas = await loadHtml2Canvas();

  // Hide the trigger button during capture
  const trigger = document.querySelector('.blindspot-trigger');
  if (trigger) trigger.style.visibility = 'hidden';

  try {
    // Get computed background color from body or html
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
    const backgroundColor = bodyBg !== 'rgba(0, 0, 0, 0)' ? bodyBg : (htmlBg !== 'rgba(0, 0, 0, 0)' ? htmlBg : '#ffffff');

    const canvas = await html2canvas(document.documentElement, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: backgroundColor,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      x: window.scrollX,
      y: window.scrollY,
    });

    const dataUrl = canvas.toDataURL('image/png');
    console.log('[Blindspot] Screenshot captured', {
      width: canvas.width,
      height: canvas.height,
      size: Math.round(dataUrl.length / 1024) + 'kb'
    });

    return dataUrl;
  } finally {
    // Restore trigger button
    if (trigger) trigger.style.visibility = 'visible';
  }
}
