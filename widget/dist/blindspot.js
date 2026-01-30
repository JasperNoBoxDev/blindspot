var Blindspot = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var src_exports = {};
  __export(src_exports, {
    init: () => init
  });

  // src/styles.js
  var CSS = `
.blindspot-trigger {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2147483647;
  background: #FE795D;
  color: white;
  border: none;
  padding: 16px 10px 12px 10px;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: -2px 2px 8px rgba(0,0,0,0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.blindspot-trigger:hover {
  transform: translateY(-50%);
  background: #e5684d;
}

.blindspot-trigger svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.blindspot-trigger-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 0.5px;
}

.blindspot-trigger-dots {
  display: flex;
  flex-direction: column;
  gap: 3px;
  opacity: 0.7;
}

.blindspot-trigger-dots span {
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
}

/* Overlay */
.blindspot-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.blindspot-overlay-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #201E1D;
}

.blindspot-overlay-content {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  z-index: 1;
  background: transparent;
}

/* Toolbar */
.blindspot-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #201E1D;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.blindspot-toolbar-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.blindspot-close-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.blindspot-close-btn:hover {
  background: rgba(255,255,255,0.1);
}

/* Tool buttons */
.blindspot-tool-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.blindspot-tool-divider {
  width: 1px;
  height: 24px;
  background: rgba(255,255,255,0.2);
  margin: 0 8px;
}

.blindspot-tool-btn {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.blindspot-tool-btn:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

.blindspot-tool-btn.active {
  background: #9B78F4;
  color: white;
}

/* Main content area */
.blindspot-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: transparent;
}

.blindspot-canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: auto;
  background: #201E1D;
  min-height: 0;
}

.blindspot-canvas-wrapper {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.3);
  overflow: hidden;
}

.blindspot-screenshot {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 120px);
}

.blindspot-drawing-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

/* Sidebar */
.blindspot-sidebar {
  width: 320px;
  background: white;
  border-left: 1px solid rgba(0,0,0,0.1);
  overflow-y: auto;
  flex-shrink: 0;
}

.blindspot-sidebar-content {
  padding: 20px;
}

.blindspot-sidebar-header {
  margin-bottom: 20px;
}

.blindspot-sidebar-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #201E1D;
}

/* Form */
.blindspot-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.blindspot-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.blindspot-label {
  font-size: 13px;
  font-weight: 500;
  color: #201E1D;
}

.blindspot-input,
.blindspot-textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.blindspot-input:focus,
.blindspot-textarea:focus {
  outline: none;
  border-color: #FE795D;
  box-shadow: 0 0 0 3px rgba(254, 121, 93, 0.15);
}

.blindspot-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Metadata display */
.blindspot-metadata {
  background: #f5f5f5;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
}

.blindspot-metadata-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.blindspot-metadata-item:not(:last-child) {
  border-bottom: 1px solid #e5e5e5;
}

.blindspot-metadata-label {
  color: #666;
  font-weight: 500;
}

.blindspot-metadata-value {
  color: #201E1D;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

/* Submit button */
.blindspot-submit-btn {
  background: #FE795D;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}

.blindspot-submit-btn:hover {
  background: #e5684d;
}

.blindspot-submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Success message */
.blindspot-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
}

.blindspot-success-icon {
  margin-bottom: 16px;
}

.blindspot-success-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #201E1D;
}

.blindspot-success-text {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
}

.blindspot-success-link {
  display: inline-block;
  background: #FE795D;
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  transition: background 0.2s;
}

.blindspot-success-link:hover {
  background: #e5684d;
}

.blindspot-close-overlay-btn {
  background: transparent;
  border: 1px solid #ddd;
  color: #666;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.blindspot-close-overlay-btn:hover {
  background: #f5f5f5;
}
`;
  function injectStyles() {
    if (document.getElementById("blindspot-styles"))
      return;
    const style = document.createElement("style");
    style.id = "blindspot-styles";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // src/trigger.js
  var CLIP_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
</svg>
`;
  var triggerButton = null;
  var onTriggerCallback = null;
  function createTrigger(onTrigger) {
    if (triggerButton)
      return triggerButton;
    onTriggerCallback = onTrigger;
    triggerButton = document.createElement("button");
    triggerButton.className = "blindspot-trigger";
    triggerButton.innerHTML = `
    ${CLIP_ICON}
    <span class="blindspot-trigger-text">Report issue</span>
    <span class="blindspot-trigger-dots">
      <span></span>
      <span></span>
      <span></span>
    </span>
  `;
    triggerButton.setAttribute("aria-label", "Report a bug");
    triggerButton.addEventListener("click", handleClick);
    document.body.appendChild(triggerButton);
    return triggerButton;
  }
  function handleClick() {
    console.log("[Blindspot] Trigger clicked");
    if (onTriggerCallback) {
      onTriggerCallback();
    }
  }
  function hideTrigger() {
    if (triggerButton) {
      triggerButton.style.display = "none";
    }
  }
  function showTrigger() {
    if (triggerButton) {
      triggerButton.style.display = "flex";
    }
  }

  // src/capture.js
  var HTML2CANVAS_URL = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  var html2canvasLoaded = false;
  function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
      if (html2canvasLoaded && window.html2canvas) {
        resolve(window.html2canvas);
        return;
      }
      const script = document.createElement("script");
      script.src = HTML2CANVAS_URL;
      script.onload = () => {
        html2canvasLoaded = true;
        console.log("[Blindspot] html2canvas loaded");
        resolve(window.html2canvas);
      };
      script.onerror = () => {
        reject(new Error("Failed to load html2canvas"));
      };
      document.head.appendChild(script);
    });
  }
  async function captureScreenshot() {
    console.log("[Blindspot] Capturing screenshot...");
    const html2canvas = await loadHtml2Canvas();
    const trigger = document.querySelector(".blindspot-trigger");
    if (trigger)
      trigger.style.visibility = "hidden";
    try {
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
      const backgroundColor = bodyBg !== "rgba(0, 0, 0, 0)" ? bodyBg : htmlBg !== "rgba(0, 0, 0, 0)" ? htmlBg : "#ffffff";
      const canvas2 = await html2canvas(document.documentElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
        x: window.scrollX,
        y: window.scrollY
      });
      const dataUrl = canvas2.toDataURL("image/png");
      console.log("[Blindspot] Screenshot captured", {
        width: canvas2.width,
        height: canvas2.height,
        size: Math.round(dataUrl.length / 1024) + "kb"
      });
      return dataUrl;
    } finally {
      if (trigger)
        trigger.style.visibility = "visible";
    }
  }

  // src/sidebar.js
  var onSubmitCallback = null;
  function createSidebarHTML(metadata, onSubmit) {
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
  function initSidebarEvents() {
    const form = document.getElementById("blindspot-form");
    if (form) {
      form.addEventListener("submit", handleSubmit);
    }
  }
  function handleSubmit(e) {
    e.preventDefault();
    const title = document.getElementById("blindspot-title").value.trim();
    const description = document.getElementById("blindspot-description").value.trim();
    const reporter = document.getElementById("blindspot-reporter").value.trim();
    if (!title) {
      return;
    }
    console.log("[Blindspot] Form submitted", { title, description, reporter });
    if (onSubmitCallback) {
      onSubmitCallback({ title, description, reporter });
    }
  }
  function truncate(str, length) {
    if (str.length <= length)
      return str;
    return str.substring(0, length) + "...";
  }

  // src/metadata.js
  function collectMetadata() {
    return {
      url: window.location.href,
      browser: getBrowser(),
      os: getOS(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      userAgent: navigator.userAgent,
      consoleErrors: getRecentConsoleErrors()
    };
  }
  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox/")) {
      const match = ua.match(/Firefox\/(\d+)/);
      return `Firefox ${match ? match[1] : ""}`;
    }
    if (ua.includes("Edg/")) {
      const match = ua.match(/Edg\/(\d+)/);
      return `Edge ${match ? match[1] : ""}`;
    }
    if (ua.includes("Chrome/")) {
      const match = ua.match(/Chrome\/(\d+)/);
      return `Chrome ${match ? match[1] : ""}`;
    }
    if (ua.includes("Safari/") && !ua.includes("Chrome")) {
      const match = ua.match(/Version\/(\d+)/);
      return `Safari ${match ? match[1] : ""}`;
    }
    return "Unknown";
  }
  function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes("Mac OS X")) {
      const match = ua.match(/Mac OS X (\d+[._]\d+)/);
      if (match) {
        return `macOS ${match[1].replace("_", ".")}`;
      }
      return "macOS";
    }
    if (ua.includes("Windows NT 10"))
      return "Windows 10/11";
    if (ua.includes("Windows NT 6.3"))
      return "Windows 8.1";
    if (ua.includes("Windows NT 6.2"))
      return "Windows 8";
    if (ua.includes("Windows NT 6.1"))
      return "Windows 7";
    if (ua.includes("Linux"))
      return "Linux";
    if (ua.includes("Android"))
      return "Android";
    if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad"))
      return "iOS";
    return "Unknown";
  }
  var consoleErrors = [];
  var MAX_ERRORS = 10;
  var originalConsoleError = console.error;
  console.error = function(...args) {
    consoleErrors.push({
      type: "error",
      message: args.map((arg) => String(arg)).join(" "),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (consoleErrors.length > MAX_ERRORS) {
      consoleErrors.shift();
    }
    originalConsoleError.apply(console, args);
  };
  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      consoleErrors.push({
        type: "uncaught",
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (consoleErrors.length > MAX_ERRORS) {
        consoleErrors.shift();
      }
    });
  }
  function getRecentConsoleErrors() {
    return [...consoleErrors];
  }

  // src/canvas.js
  var canvas = null;
  var ctx = null;
  var isDrawing = false;
  var currentTool = "arrow";
  var startX = 0;
  var startY = 0;
  var lastX = 0;
  var lastY = 0;
  var paths = [];
  var currentPath = null;
  var textInput = null;
  var STROKE_COLOR = "#9B78F4";
  var STROKE_WIDTH = 3;
  var FONT_SIZE = 16;
  function initCanvas(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.strokeStyle = STROKE_COLOR;
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);
    console.log("[Blindspot] Canvas initialized", { width: canvas.width, height: canvas.height });
  }
  function setTool(tool) {
    currentTool = tool;
    console.log("[Blindspot] Tool set to:", tool);
  }
  function clearCanvas() {
    if (!ctx || !canvas)
      return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paths = [];
    console.log("[Blindspot] Canvas cleared");
  }
  function undoLast() {
    if (paths.length === 0)
      return;
    paths.pop();
    redrawAll();
    console.log("[Blindspot] Undo - paths remaining:", paths.length);
  }
  function hasAnnotations() {
    return paths.length > 0;
  }
  function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    startX = (e.clientX - rect.left) * scaleX;
    startY = (e.clientY - rect.top) * scaleY;
    lastX = startX;
    lastY = startY;
    if (currentTool === "text") {
      showTextInput(e.clientX, e.clientY, startX, startY);
      return;
    }
    isDrawing = true;
    if (currentTool === "draw") {
      currentPath = {
        type: "draw",
        points: [{ x: startX, y: startY }]
      };
    }
  }
  function handleMouseMove(e) {
    if (!isDrawing)
      return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    if (currentTool === "draw") {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      currentPath.points.push({ x, y });
      lastX = x;
      lastY = y;
    } else {
      redrawAll();
      drawPreview(x, y);
    }
  }
  function handleMouseUp(e) {
    if (!isDrawing)
      return;
    isDrawing = false;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const endX = (e.clientX - rect.left) * scaleX;
    const endY = (e.clientY - rect.top) * scaleY;
    if (currentTool === "draw" && currentPath) {
      paths.push(currentPath);
      currentPath = null;
    } else if (currentTool === "arrow") {
      paths.push({
        type: "arrow",
        startX,
        startY,
        endX,
        endY
      });
      redrawAll();
    } else if (currentTool === "rectangle") {
      paths.push({
        type: "rectangle",
        startX,
        startY,
        endX,
        endY
      });
      redrawAll();
    }
  }
  function showTextInput(screenX, screenY, canvasX, canvasY) {
    hideTextInput();
    const container = document.createElement("div");
    container.id = "blindspot-text-container";
    container.style.cssText = `
    position: fixed;
    left: ${screenX}px;
    top: ${screenY}px;
    z-index: 2147483647;
    transform: translate(0, -50%);
  `;
    textInput = document.createElement("input");
    textInput.type = "text";
    textInput.style.cssText = `
    background: white;
    border: 2px solid ${STROKE_COLOR};
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #201E1D;
    outline: none;
    min-width: 150px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
    textInput.placeholder = "Type text...";
    const handleKeyDown2 = (e) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        if (textInput.value.trim()) {
          addText(canvasX, canvasY, textInput.value.trim());
        }
        hideTextInput();
      } else if (e.key === "Escape") {
        e.preventDefault();
        hideTextInput();
      }
    };
    const handleBlur = () => {
      setTimeout(() => {
        if (textInput && textInput.value.trim()) {
          addText(canvasX, canvasY, textInput.value.trim());
        }
        hideTextInput();
      }, 100);
    };
    textInput.addEventListener("keydown", handleKeyDown2);
    textInput.addEventListener("blur", handleBlur);
    container.appendChild(textInput);
    document.body.appendChild(container);
    setTimeout(() => {
      if (textInput)
        textInput.focus();
    }, 10);
    console.log("[Blindspot] Text input shown at", screenX, screenY);
  }
  function hideTextInput() {
    const container = document.getElementById("blindspot-text-container");
    if (container) {
      container.remove();
    }
    textInput = null;
  }
  function addText(x, y, text) {
    paths.push({
      type: "text",
      x,
      y,
      text
    });
    redrawAll();
    console.log("[Blindspot] Text added:", text);
  }
  function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    handleMouseDown(mouseEvent);
  }
  function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    handleMouseMove(mouseEvent);
  }
  function handleTouchEnd(e) {
    const mouseEvent = new MouseEvent("mouseup", {});
    handleMouseUp(mouseEvent);
  }
  function drawPreview(x, y) {
    if (currentTool === "arrow") {
      drawArrow(startX, startY, x, y);
    } else if (currentTool === "rectangle") {
      drawRectangle(startX, startY, x, y);
    }
  }
  function redrawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = STROKE_COLOR;
    ctx.lineWidth = STROKE_WIDTH;
    for (const path of paths) {
      if (path.type === "draw") {
        drawPath(path.points);
      } else if (path.type === "arrow") {
        drawArrow(path.startX, path.startY, path.endX, path.endY);
      } else if (path.type === "rectangle") {
        drawRectangle(path.startX, path.startY, path.endX, path.endY);
      } else if (path.type === "text") {
        drawText(path.x, path.y, path.text);
      }
    }
  }
  function drawPath(points) {
    if (points.length < 2)
      return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }
  function drawArrow(fromX, fromY, toX, toY) {
    const headLength = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  }
  function drawRectangle(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
  }
  function drawText(x, y, text) {
    ctx.font = `bold ${FONT_SIZE}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.fillStyle = STROKE_COLOR;
    ctx.fillText(text, x, y);
  }
  function destroyCanvas() {
    if (!canvas)
      return;
    hideTextInput();
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseup", handleMouseUp);
    canvas.removeEventListener("mouseleave", handleMouseUp);
    canvas.removeEventListener("touchstart", handleTouchStart);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchend", handleTouchEnd);
    canvas = null;
    ctx = null;
    paths = [];
  }

  // src/toolbar.js
  var toolbarElement = null;
  var activeButton = null;
  var ICONS = {
    arrow: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>`,
    rectangle: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  </svg>`,
    text: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="4 7 4 4 20 4 20 7"/>
    <line x1="9" y1="20" x2="15" y2="20"/>
    <line x1="12" y1="4" x2="12" y2="20"/>
  </svg>`,
    draw: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
    <path d="M2 2l7.586 7.586"/>
    <circle cx="11" cy="11" r="2"/>
  </svg>`,
    undo: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 7v6h6"/>
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
  </svg>`,
    clear: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>`
  };
  function createToolbarHTML() {
    return `
    <div class="blindspot-tool-group">
      <button class="blindspot-tool-btn active" data-tool="arrow" title="Arrow">
        ${ICONS.arrow}
      </button>
      <button class="blindspot-tool-btn" data-tool="rectangle" title="Box">
        ${ICONS.rectangle}
      </button>
      <button class="blindspot-tool-btn" data-tool="text" title="Text">
        ${ICONS.text}
      </button>
      <button class="blindspot-tool-btn" data-tool="draw" title="Freeform">
        ${ICONS.draw}
      </button>
    </div>
    <div class="blindspot-tool-divider"></div>
    <div class="blindspot-tool-group">
      <button class="blindspot-tool-btn" data-action="undo" title="Undo">
        ${ICONS.undo}
      </button>
      <button class="blindspot-tool-btn" data-action="clear" title="Clear all">
        ${ICONS.clear}
      </button>
    </div>
  `;
  }
  function initToolbar(container) {
    toolbarElement = container;
    const toolBtns = container.querySelectorAll("[data-tool]");
    toolBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tool = btn.dataset.tool;
        setTool(tool);
        updateActiveButton(btn);
      });
    });
    const actionBtns = container.querySelectorAll("[data-action]");
    actionBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        if (action === "undo") {
          undoLast();
        } else if (action === "clear") {
          clearCanvas();
        }
      });
    });
    activeButton = container.querySelector('[data-tool="arrow"]');
  }
  function updateActiveButton(btn) {
    if (activeButton) {
      activeButton.classList.remove("active");
    }
    btn.classList.add("active");
    activeButton = btn;
  }
  function destroyToolbar() {
    toolbarElement = null;
    activeButton = null;
  }

  // src/overlay.js
  var overlayElement = null;
  var screenshotData = null;
  var metadataCache = null;
  var onCloseCallback = null;
  var onSubmitCallback2 = null;
  function showOverlay(screenshot, options = {}) {
    if (overlayElement)
      return;
    screenshotData = screenshot;
    onCloseCallback = options.onClose;
    onSubmitCallback2 = options.onSubmit;
    metadataCache = collectMetadata();
    overlayElement = document.createElement("div");
    overlayElement.className = "blindspot-overlay";
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
            <img class="blindspot-screenshot" src="${screenshot}" alt="Screenshot" />
            <canvas class="blindspot-drawing-canvas"></canvas>
          </div>
        </div>
        <div class="blindspot-sidebar">
          ${createSidebarHTML(metadataCache, handleFormSubmit)}
        </div>
      </div>
    </div>
  `;
    overlayElement.querySelector(".blindspot-close-btn").addEventListener("click", hideOverlay);
    overlayElement.querySelector(".blindspot-overlay-backdrop").addEventListener("click", hideOverlay);
    document.addEventListener("keydown", handleKeyDown);
    document.body.appendChild(overlayElement);
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      const toolbarContainer = overlayElement.querySelector(".blindspot-toolbar-tools");
      initToolbar(toolbarContainer);
      const img = overlayElement.querySelector(".blindspot-screenshot");
      const canvas2 = overlayElement.querySelector(".blindspot-drawing-canvas");
      img.onload = () => {
        canvas2.width = img.naturalWidth;
        canvas2.height = img.naturalHeight;
        initCanvas(canvas2);
      };
      if (img.complete) {
        canvas2.width = img.naturalWidth;
        canvas2.height = img.naturalHeight;
        initCanvas(canvas2);
      }
      initSidebarEvents();
    }, 0);
    console.log("[Blindspot] Overlay opened");
  }
  function hideOverlay() {
    if (!overlayElement)
      return;
    document.removeEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "";
    destroyToolbar();
    destroyCanvas();
    overlayElement.remove();
    overlayElement = null;
    screenshotData = null;
    metadataCache = null;
    if (onCloseCallback) {
      onCloseCallback();
      onCloseCallback = null;
    }
    console.log("[Blindspot] Overlay closed");
  }
  function handleKeyDown(e) {
    if (e.key === "Escape") {
      hideOverlay();
    }
  }
  function handleFormSubmit(formData) {
    if (onSubmitCallback2) {
      let finalScreenshot = screenshotData;
      if (hasAnnotations()) {
        finalScreenshot = mergeScreenshotWithAnnotations();
      }
      onSubmitCallback2({
        ...formData,
        screenshot: finalScreenshot,
        metadata: metadataCache
      });
    }
  }
  function mergeScreenshotWithAnnotations() {
    const img = overlayElement.querySelector(".blindspot-screenshot");
    const drawingCanvas = overlayElement.querySelector(".blindspot-drawing-canvas");
    const mergeCanvas = document.createElement("canvas");
    mergeCanvas.width = img.naturalWidth;
    mergeCanvas.height = img.naturalHeight;
    const ctx2 = mergeCanvas.getContext("2d");
    ctx2.drawImage(img, 0, 0);
    ctx2.drawImage(drawingCanvas, 0, 0);
    return mergeCanvas.toDataURL("image/png");
  }

  // src/index.js
  var config = {
    repo: null,
    workerUrl: null
  };
  function init(options = {}) {
    if (!options.repo) {
      console.error("[Blindspot] Missing required option: repo");
      return;
    }
    if (!options.workerUrl) {
      console.error("[Blindspot] Missing required option: workerUrl");
      return;
    }
    config.repo = options.repo;
    config.workerUrl = options.workerUrl;
    injectStyles();
    createTrigger(handleTrigger);
    console.log("[Blindspot] Initialized", { repo: config.repo });
  }
  async function handleTrigger() {
    console.log("[Blindspot] Starting capture mode...");
    try {
      hideTrigger();
      const screenshot = await captureScreenshot();
      console.log("[Blindspot] Screenshot ready, opening overlay...");
      showOverlay(screenshot, {
        onClose: () => {
          showTrigger();
        },
        onSubmit: handleSubmit2
      });
    } catch (error) {
      console.error("[Blindspot] Capture failed:", error);
      showTrigger();
    }
  }
  async function handleSubmit2(data) {
    console.log("[Blindspot] Submitting report...", data);
    const submitBtn = document.querySelector(".blindspot-submit-btn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }
    try {
      const response = await fetch(`${config.workerUrl}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          reporter: data.reporter,
          screenshot: data.screenshot,
          metadata: data.metadata,
          repo: config.repo
        })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit report");
      }
      console.log("[Blindspot] Report submitted successfully:", result);
      showSuccessMessage(result.issueUrl);
    } catch (error) {
      console.error("[Blindspot] Submit failed:", error);
      alert(`Failed to submit report: ${error.message}`);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Bug Report";
      }
    }
  }
  function showSuccessMessage(issueUrl) {
    const sidebar = document.querySelector(".blindspot-sidebar-content");
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
        ${issueUrl ? `<a href="${issueUrl}" target="_blank" class="blindspot-success-link">View Issue on GitHub</a>` : ""}
        <button class="blindspot-close-overlay-btn" onclick="document.querySelector('.blindspot-close-btn').click()">Close</button>
      </div>
    `;
    }
  }
  return __toCommonJS(src_exports);
})();
