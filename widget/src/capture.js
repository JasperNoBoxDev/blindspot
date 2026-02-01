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
 * @returns {Promise<Object>} { dataUrl, elementMap, viewport }
 */
export async function captureScreenshot() {
  console.log('[Blindspot] Capturing screenshot...');

  const html2canvas = await loadHtml2Canvas();

  // Hide the trigger button during capture
  const trigger = document.querySelector('.blindspot-trigger');
  if (trigger) trigger.style.visibility = 'hidden';

  try {
    // Capture element positions BEFORE screenshot (while page is in exact state)
    const elementMap = captureElementMap();

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
      logging: false,
      imageTimeout: 5000,
      onclone: (clonedDoc) => {
        // Wait for images to load in cloned document
        const images = clonedDoc.querySelectorAll('img');
        return Promise.all(Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            // Timeout fallback
            setTimeout(resolve, 2000);
          });
        }));
      },
    });

    const dataUrl = canvas.toDataURL('image/png');
    console.log('[Blindspot] Screenshot captured', {
      width: canvas.width,
      height: canvas.height,
      size: Math.round(dataUrl.length / 1024) + 'kb',
      elements: elementMap.length
    });

    return {
      dataUrl,
      elementMap,
      viewport: {
        // Use CSS pixel dimensions, not device pixels (canvas may be scaled by devicePixelRatio)
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      }
    };
  } finally {
    // Restore trigger button
    if (trigger) trigger.style.visibility = 'visible';
  }
}

/**
 * Capture bounding boxes of all visible elements
 * @returns {Array} Array of { rect, tagName, id, classes, text, selector }
 */
function captureElementMap() {
  const elements = [];
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Walk all elements in the DOM
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        // Skip invisible elements and blindspot elements
        if (node.offsetParent === null && node.tagName !== 'BODY') return NodeFilter.FILTER_REJECT;
        if (node.classList?.contains('blindspot-trigger')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let node;
  while (node = walker.nextNode()) {
    const rect = node.getBoundingClientRect();

    // Skip elements outside viewport or too small
    if (rect.width < 5 || rect.height < 5) continue;
    if (rect.bottom < 0 || rect.top > viewportHeight) continue;
    if (rect.right < 0 || rect.left > viewportWidth) continue;

    // Get element info
    const tagName = node.tagName.toLowerCase();
    const id = node.id || null;
    const classes = node.className && typeof node.className === 'string'
      ? node.className.split(' ').filter(c => c && !c.startsWith('blindspot-'))
      : [];

    // Get computed styles for visual context
    const styles = window.getComputedStyle(node);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;

    // Get text content (direct text only, not children)
    let text = '';
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent;
      }
    }
    text = text.trim().substring(0, 150);

    // Get full inner text for context (truncated)
    const innerText = node.innerText?.trim().substring(0, 200) || '';

    // Build a simple selector
    let selector = tagName;
    if (id) {
      selector = `${tagName}#${id}`;
    } else if (classes.length > 0) {
      selector = `${tagName}.${classes.slice(0, 2).join('.')}`;
    }

    // Build full unique CSS selector path
    const fullSelector = getFullSelector(node);

    // Collect all data-* attributes (useful for finding components in code)
    const dataAttributes = {};
    for (const attr of node.attributes) {
      if (attr.name.startsWith('data-')) {
        dataAttributes[attr.name] = attr.value;
      }
    }

    // Get accessible name (what assistive tech sees)
    const accessibleName = getAccessibleName(node);

    // Get nearby landmark/context
    const context = getNearbyContext(node);

    // Build element info object
    const elementInfo = {
      rect: {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      },
      tagName,
      id,
      classes,
      text,
      innerText,
      selector,
      fullSelector,
      dataAttributes,
      accessibleName,
      context,
      styles: {
        backgroundColor: backgroundColor !== 'rgba(0, 0, 0, 0)' ? backgroundColor : null,
        color,
      },
    };

    // Add type-specific attributes
    if (tagName === 'a' && node.href) {
      elementInfo.href = node.href;
    }
    if (tagName === 'img') {
      elementInfo.src = node.src;
      elementInfo.alt = node.alt;
    }
    if (tagName === 'input' || tagName === 'button' || tagName === 'select' || tagName === 'textarea') {
      elementInfo.type = node.type;
      elementInfo.name = node.name;
      elementInfo.placeholder = node.placeholder;
      elementInfo.value = node.value?.substring(0, 100);
    }
    if (node.getAttribute('aria-label')) {
      elementInfo.ariaLabel = node.getAttribute('aria-label');
    }
    if (node.getAttribute('role')) {
      elementInfo.role = node.getAttribute('role');
    }

    elements.push(elementInfo);
  }

  // Sort by area (smallest first) so smaller elements are checked first during hover
  elements.sort((a, b) => (a.rect.width * a.rect.height) - (b.rect.width * b.rect.height));

  console.log('[Blindspot] Element map captured:', elements.length, 'elements');
  return elements;
}

/**
 * Build a full unique CSS selector path for an element
 * @param {Element} el
 * @returns {string}
 */
function getFullSelector(el) {
  const parts = [];
  let current = el;

  while (current && current !== document.body && current !== document.documentElement) {
    let part = current.tagName.toLowerCase();

    if (current.id) {
      // ID is unique, stop here
      part = `#${current.id}`;
      parts.unshift(part);
      break;
    }

    // Add classes (first 2 for brevity)
    const classes = Array.from(current.classList)
      .filter(c => !c.startsWith('blindspot-'))
      .slice(0, 2);
    if (classes.length) {
      part += '.' + classes.join('.');
    }

    // Add nth-child if needed for uniqueness
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        part += `:nth-child(${index})`;
      }
    }

    parts.unshift(part);
    current = current.parentElement;
  }

  return parts.join(' > ');
}

/**
 * Get the accessible name of an element (what screen readers announce)
 * @param {Element} el
 * @returns {string|null}
 */
function getAccessibleName(el) {
  // Priority order for accessible name
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  const ariaLabelledBy = el.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelEl = document.getElementById(ariaLabelledBy);
    if (labelEl) return labelEl.textContent?.trim();
  }

  const title = el.getAttribute('title');
  if (title) return title;

  // For inputs, check associated label
  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`);
    if (label) return label.textContent?.trim();
  }

  // For buttons/links, use text content
  if (['BUTTON', 'A'].includes(el.tagName)) {
    return el.textContent?.trim().substring(0, 100) || null;
  }

  // For images, use alt
  if (el.tagName === 'IMG') {
    return el.alt || null;
  }

  return null;
}

/**
 * Get nearby context/landmarks to help locate the element
 * @param {Element} el
 * @returns {string|null}
 */
function getNearbyContext(el) {
  const contexts = [];

  // Check for landmark ancestors
  let current = el.parentElement;
  let depth = 0;
  while (current && depth < 5) {
    const role = current.getAttribute('role');
    const tag = current.tagName.toLowerCase();

    // Check for semantic landmarks
    if (['header', 'nav', 'main', 'aside', 'footer', 'section', 'article'].includes(tag)) {
      const label = current.getAttribute('aria-label') || current.id || '';
      contexts.push(label ? `${tag}[${label}]` : tag);
    } else if (role && ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'region'].includes(role)) {
      contexts.push(`[role=${role}]`);
    }

    // Check for data-testid or data-component on parents
    const testId = current.getAttribute('data-testid') || current.getAttribute('data-component');
    if (testId) {
      contexts.push(`[data-testid=${testId}]`);
    }

    current = current.parentElement;
    depth++;
  }

  // Check position in list if applicable
  const listParent = el.closest('ul, ol');
  if (listParent) {
    const items = Array.from(listParent.children).filter(c => c.tagName === 'LI');
    const listItem = el.closest('li');
    if (listItem && items.includes(listItem)) {
      const index = items.indexOf(listItem) + 1;
      contexts.push(`list item ${index} of ${items.length}`);
    }
  }

  return contexts.length > 0 ? contexts.join(' > ') : null;
}
