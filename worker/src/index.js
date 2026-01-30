/**
 * Blindspot Worker - Receives bug reports and creates GitHub issues
 */

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST to /report
    const url = new URL(request.url);
    if (url.pathname !== '/report' || request.method !== 'POST') {
      return jsonResponse({ error: 'Not found' }, 404);
    }

    try {
      const body = await request.json();
      const result = await handleReport(body, env);
      return jsonResponse(result, 200);
    } catch (error) {
      console.error('Error processing report:', error);
      return jsonResponse({ error: error.message || 'Internal server error' }, 500);
    }
  },
};

/**
 * Handle incoming bug report
 */
async function handleReport(body, env) {
  // Validate required fields
  const { title, description, screenshot, metadata, repo, reporter } = body;

  if (!title) {
    throw new Error('Missing required field: title');
  }
  if (!repo) {
    throw new Error('Missing required field: repo');
  }
  if (!env.GITHUB_TOKEN) {
    throw new Error('GitHub token not configured');
  }

  // Parse repo owner and name
  const [owner, repoName] = repo.split('/');
  if (!owner || !repoName) {
    throw new Error('Invalid repo format. Expected: owner/repo');
  }

  // Upload screenshot if provided
  let screenshotUrl = null;
  if (screenshot) {
    screenshotUrl = await uploadScreenshot(screenshot, owner, repoName, env.GITHUB_TOKEN);
  }

  // Create GitHub issue
  const issueUrl = await createGitHubIssue({
    owner,
    repo: repoName,
    title,
    description,
    reporter,
    metadata,
    screenshotUrl,
    token: env.GITHUB_TOKEN,
  });

  return {
    success: true,
    issueUrl,
    message: 'Bug report submitted successfully',
  };
}

/**
 * Upload screenshot to GitHub repo
 */
async function uploadScreenshot(base64Data, owner, repo, token) {
  // Remove data URL prefix if present
  const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');

  // Generate unique filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `blindspot-${timestamp}.png`;
  const path = `.blindspot/screenshots/${filename}`;

  // Upload file to repo
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Blindspot-Worker',
      },
      body: JSON.stringify({
        message: `Add screenshot for bug report`,
        content: base64Content,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to upload screenshot:', error);
    // Don't fail the whole report if screenshot upload fails
    return null;
  }

  const result = await response.json();
  return result.content?.download_url || null;
}

/**
 * Create GitHub issue with bug report details
 */
async function createGitHubIssue({ owner, repo, title, description, reporter, metadata, screenshotUrl, token }) {
  // Build issue body
  let body = '';

  if (description) {
    body += `${description}\n\n`;
  }

  if (reporter) {
    body += `**Reported by:** ${reporter}\n\n`;
  }

  body += '---\n\n';

  // Add screenshot
  if (screenshotUrl) {
    body += `## Screenshot\n\n![Screenshot](${screenshotUrl})\n\n`;
  }

  // Add metadata
  if (metadata) {
    body += '## Environment\n\n';
    body += '| Property | Value |\n';
    body += '|----------|-------|\n';
    if (metadata.url) body += `| URL | ${metadata.url} |\n`;
    if (metadata.browser) body += `| Browser | ${metadata.browser} |\n`;
    if (metadata.os) body += `| OS | ${metadata.os} |\n`;
    if (metadata.viewport) body += `| Viewport | ${metadata.viewport} |\n`;
    if (metadata.timestamp) body += `| Timestamp | ${metadata.timestamp} |\n`;
    body += '\n';

    // Add console errors if any
    if (metadata.consoleErrors && metadata.consoleErrors.length > 0) {
      body += '## Console Errors\n\n';
      body += '```\n';
      for (const err of metadata.consoleErrors) {
        body += `${err.type}: ${err.message}\n`;
      }
      body += '```\n\n';
    }
  }

  body += '---\n*Reported via [Blindspot](https://github.com/No-Box-Dev/blindspot)*';

  // Create issue
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Blindspot-Worker',
      },
      body: JSON.stringify({
        title,
        body,
        labels: ['blindspot', 'bug'],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create issue: ${error}`);
  }

  const issue = await response.json();
  return issue.html_url;
}

/**
 * Helper to create JSON response with CORS headers
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}
