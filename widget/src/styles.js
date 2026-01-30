/**
 * Blindspot styles - injected into page
 */

const CSS = `
.blindspot-trigger {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 2147483647;
  background: #FE795D;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 50px;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.blindspot-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.blindspot-trigger svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.blindspot-trigger-text {
  letter-spacing: 0.3px;
}

.blindspot-trigger-dots {
  display: none;
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

export function injectStyles() {
  if (document.getElementById('blindspot-styles')) return;

  const style = document.createElement('style');
  style.id = 'blindspot-styles';
  style.textContent = CSS;
  document.head.appendChild(style);
}
