/**
 * Auto-collect metadata about the page and environment
 */

/**
 * Collect all metadata
 * @returns {Object} Metadata object
 */
export function collectMetadata() {
  return {
    url: window.location.href,
    browser: getBrowser(),
    os: getOS(),
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    consoleErrors: getRecentConsoleErrors(),
  };
}

function getBrowser() {
  const ua = navigator.userAgent;

  if (ua.includes('Firefox/')) {
    const match = ua.match(/Firefox\/(\d+)/);
    return `Firefox ${match ? match[1] : ''}`;
  }
  if (ua.includes('Edg/')) {
    const match = ua.match(/Edg\/(\d+)/);
    return `Edge ${match ? match[1] : ''}`;
  }
  if (ua.includes('Chrome/')) {
    const match = ua.match(/Chrome\/(\d+)/);
    return `Chrome ${match ? match[1] : ''}`;
  }
  if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    const match = ua.match(/Version\/(\d+)/);
    return `Safari ${match ? match[1] : ''}`;
  }

  return 'Unknown';
}

function getOS() {
  const ua = navigator.userAgent;

  if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    if (match) {
      return `macOS ${match[1].replace('_', '.')}`;
    }
    return 'macOS';
  }
  if (ua.includes('Windows NT 10')) return 'Windows 10/11';
  if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (ua.includes('Windows NT 6.2')) return 'Windows 8';
  if (ua.includes('Windows NT 6.1')) return 'Windows 7';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';

  return 'Unknown';
}

// Store console errors
const consoleErrors = [];
const MAX_ERRORS = 10;

// Intercept console.error
const originalConsoleError = console.error;
console.error = function(...args) {
  consoleErrors.push({
    type: 'error',
    message: args.map(arg => String(arg)).join(' '),
    timestamp: new Date().toISOString(),
  });
  if (consoleErrors.length > MAX_ERRORS) {
    consoleErrors.shift();
  }
  originalConsoleError.apply(console, args);
};

// Listen for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    consoleErrors.push({
      type: 'uncaught',
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      timestamp: new Date().toISOString(),
    });
    if (consoleErrors.length > MAX_ERRORS) {
      consoleErrors.shift();
    }
  });
}

function getRecentConsoleErrors() {
  return [...consoleErrors];
}
