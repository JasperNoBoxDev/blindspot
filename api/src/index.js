import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

const app = new Hono();

// CORS for all routes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// Root
app.get('/', (c) => {
  return c.json({
    name: 'Blindspot API',
    version: '1.0.0'
  });
});

// OAuth: Redirect to GitHub
app.get('/auth/github', (c) => {
  const clientId = c.env.GITHUB_CLIENT_ID;
  const redirectUri = 'https://blindspot-api.jasper-414.workers.dev/auth/github/callback';
  const scope = 'repo';

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

  return c.redirect(githubAuthUrl);
});

// OAuth: Callback from GitHub
app.get('/auth/github/callback', async (c) => {
  const code = c.req.query('code');

  if (!code) {
    return c.json({ error: 'No code provided' }, 400);
  }

  // Exchange code for access token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: c.env.GITHUB_CLIENT_ID,
      client_secret: c.env.GITHUB_CLIENT_SECRET,
      code: code,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return c.json({ error: tokenData.error_description }, 400);
  }

  const accessToken = tokenData.access_token;

  // Fetch GitHub user info
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'Blindspot',
    },
  });

  const githubUser = await userResponse.json();

  // Generate user ID
  const userId = crypto.randomUUID();

  // Insert or update user in database
  await c.env.DB.prepare(`
    INSERT INTO users (id, github_user_id, github_username, github_access_token)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(github_user_id) DO UPDATE SET
      github_username = excluded.github_username,
      github_access_token = excluded.github_access_token
  `).bind(userId, String(githubUser.id), githubUser.login, accessToken).run();

  // Get the actual user (in case it was an update, not insert)
  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE github_user_id = ?'
  ).bind(String(githubUser.id)).first();

  // Create JWT token
  const token = await sign(
    {
      sub: user.id,
      username: user.github_username,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    },
    c.env.JWT_SECRET
  );

  // Redirect to dashboard with token in URL (frontend will store in localStorage)
  return c.redirect(`https://getblindspot.pages.dev/dashboard.html?token=${token}`);
});

// Get current user
app.get('/auth/me', async (c) => {
  // Check Authorization header first, then cookie
  const authHeader = c.req.header('Authorization');
  let token = authHeader?.replace('Bearer ', '');

  if (!token) {
    token = getCookie(c, 'token');
  }

  if (!token) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256');

    // Get user from database
    const user = await c.env.DB.prepare(
      'SELECT id, github_username, created_at FROM users WHERE id = ?'
    ).bind(payload.sub).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      id: user.id,
      username: user.github_username,
      created_at: user.created_at,
    });
  } catch (e) {
    console.log('JWT error:', e.message, 'Token:', token?.substring(0, 20));
    return c.json({ error: 'Invalid token', details: e.message }, 401);
  }
});

// Logout
app.post('/auth/logout', (c) => {
  deleteCookie(c, 'token', {
    path: '/',
  });

  return c.json({ success: true });
});

// Helper: Get user from token
async function getUserFromToken(c) {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) return null;

  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256');
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(payload.sub).first();
    return user;
  } catch (e) {
    return null;
  }
}

// Create a site
app.post('/sites', async (c) => {
  const user = await getUserFromToken(c);

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  const body = await c.req.json();
  const { name, repoOwner, repoName, buttonColor, buttonText } = body;

  if (!name || !repoOwner || !repoName) {
    return c.json({ error: 'Missing required fields: name, repoOwner, repoName' }, 400);
  }

  const siteId = crypto.randomUUID();
  const color = buttonColor || '#FE795D';
  const text = buttonText || 'Report issue';

  await c.env.DB.prepare(`
    INSERT INTO sites (id, user_id, name, repo_owner, repo_name, button_color, button_text)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(siteId, user.id, name, repoOwner, repoName, color, text).run();

  return c.json({
    id: siteId,
    name,
    repoOwner,
    repoName,
    buttonColor: color,
    buttonText: text,
  }, 201);
});

// List user's sites
app.get('/sites', async (c) => {
  const user = await getUserFromToken(c);

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM sites WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.id).all();

  return c.json(results);
});

// Update a site
app.put('/sites/:id', async (c) => {
  const user = await getUserFromToken(c);

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  const siteId = c.req.param('id');
  const body = await c.req.json();
  const { buttonColor, buttonText } = body;

  // Verify site belongs to user
  const site = await c.env.DB.prepare(
    'SELECT * FROM sites WHERE id = ? AND user_id = ?'
  ).bind(siteId, user.id).first();

  if (!site) {
    return c.json({ error: 'Site not found' }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE sites SET button_color = ?, button_text = ? WHERE id = ?
  `).bind(buttonColor || site.button_color, buttonText || site.button_text, siteId).run();

  return c.json({ success: true });
});

// Delete a site
app.delete('/sites/:id', async (c) => {
  const user = await getUserFromToken(c);

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  const siteId = c.req.param('id');

  // Verify site belongs to user
  const site = await c.env.DB.prepare(
    'SELECT * FROM sites WHERE id = ? AND user_id = ?'
  ).bind(siteId, user.id).first();

  if (!site) {
    return c.json({ error: 'Site not found' }, 404);
  }

  await c.env.DB.prepare('DELETE FROM sites WHERE id = ?').bind(siteId).run();

  return c.json({ success: true });
});

// Submit bug report
app.post('/report', async (c) => {
  const body = await c.req.json();
  const { siteId, title, description, reporter, screenshot, metadata } = body;

  if (!siteId || !title) {
    return c.json({ error: 'Missing required fields: siteId, title' }, 400);
  }

  // Look up site and get owner's GitHub token
  const site = await c.env.DB.prepare(`
    SELECT sites.*, users.github_access_token
    FROM sites
    JOIN users ON sites.user_id = users.id
    WHERE sites.id = ?
  `).bind(siteId).first();

  if (!site) {
    return c.json({ error: 'Site not found' }, 404);
  }

  // Upload screenshot to GitHub (if provided)
  let screenshotUrl = null;
  if (screenshot && screenshot.startsWith('data:image')) {
    const base64Data = screenshot.split(',')[1];
    const filename = `blindspot-${Date.now()}.png`;

    // Upload to repo's .blindspot folder
    const uploadResponse = await fetch(
      `https://api.github.com/repos/${site.repo_owner}/${site.repo_name}/contents/.blindspot/${filename}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${site.github_access_token}`,
          'User-Agent': 'Blindspot',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add screenshot for bug report: ${title}`,
          content: base64Data,
        }),
      }
    );

    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      screenshotUrl = uploadData.content.download_url;
    }
  }

  // Build issue body
  let issueBody = '';

  if (description) {
    issueBody += `${description}\n\n`;
  }

  if (reporter) {
    issueBody += `**Reported by:** ${reporter}\n\n`;
  }

  if (screenshotUrl) {
    issueBody += `## Screenshot\n![Screenshot](${screenshotUrl})\n\n`;
  }

  if (metadata) {
    issueBody += `## Environment\n`;
    issueBody += `| Property | Value |\n`;
    issueBody += `|----------|-------|\n`;
    if (metadata.url) issueBody += `| URL | ${metadata.url} |\n`;
    if (metadata.browser) issueBody += `| Browser | ${metadata.browser} |\n`;
    if (metadata.os) issueBody += `| OS | ${metadata.os} |\n`;
    if (metadata.viewport) issueBody += `| Viewport | ${metadata.viewport} |\n`;
    if (metadata.timestamp) issueBody += `| Time | ${metadata.timestamp} |\n`;

    if (metadata.consoleErrors && metadata.consoleErrors.length > 0) {
      issueBody += `\n## Console Errors\n\`\`\`\n`;
      for (const err of metadata.consoleErrors) {
        issueBody += `${err.message}\n`;
      }
      issueBody += `\`\`\`\n`;
    }
  }

  issueBody += `\n---\n*Reported via [Blindspot](https://getblindspot.pages.dev)*`;

  // Create GitHub issue
  const issueResponse = await fetch(
    `https://api.github.com/repos/${site.repo_owner}/${site.repo_name}/issues`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${site.github_access_token}`,
        'User-Agent': 'Blindspot',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        body: issueBody,
        labels: ['blindspot', 'bug'],
      }),
    }
  );

  if (!issueResponse.ok) {
    const error = await issueResponse.json();
    return c.json({ error: 'Failed to create issue', details: error.message }, 500);
  }

  const issue = await issueResponse.json();

  return c.json({
    success: true,
    issueUrl: issue.html_url,
    issueNumber: issue.number,
  });
});

// List user's GitHub repos
app.get('/github/repos', async (c) => {
  const user = await getUserFromToken(c);

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  // Fetch repos from GitHub
  const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
    headers: {
      'Authorization': `Bearer ${user.github_access_token}`,
      'User-Agent': 'Blindspot',
    },
  });

  if (!response.ok) {
    return c.json({ error: 'Failed to fetch repos' }, 500);
  }

  const repos = await response.json();

  // Return simplified repo list
  return c.json(repos.map(repo => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    owner: repo.owner.login,
    private: repo.private,
    updated_at: repo.updated_at,
  })));
});

export default app;
