// scripts/getRefreshToken.js
const express = require('express');
const { AuthorizationCode } = require('simple-oauth2');
require('dotenv').config();

const app = express();
const port = 3000;

const REDIRECT_URI = `http://localhost:${port}/callback`;

// Define scopes - Updated for Microsoft personal accounts
const SCOPES = [
  'offline_access',
  'https://graph.microsoft.com/Mail.Send',
  'https://graph.microsoft.com/User.Read',
  'openid',
  'profile',
  'email'
].join(' ');

const config = {
  client: {
    id: process.env.AZURE_CLIENT_ID,
    secret: process.env.AZURE_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    tokenPath: '/consumers/oauth2/v2.0/token',
    authorizePath: '/consumers/oauth2/v2.0/authorize'
  }
};

const client = new AuthorizationCode(config);

// Get authorization URL
const authorizationUri = client.authorizeURL({
  redirect_uri: REDIRECT_URI,
  scope: SCOPES,
  prompt: 'consent',
  response_type: 'code'
});

app.get('/login', (_req, res) => {
  console.log('Redirecting to:', authorizationUri);
  res.redirect(authorizationUri);
});

app.get('/callback', async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    console.error('Auth Error:', error, error_description);
    return res.status(400).send(`Authentication error: ${error_description}`);
  }

  if (!code) {
    return res.status(400).send('No code parameter received');
  }

  try {
    console.log('Received code:', code);

    const tokenParams = {
      code,
      redirect_uri: REDIRECT_URI,
      scope: SCOPES
    };

    console.log('Requesting token with params:', {
      ...tokenParams,
      client_id: config.client.id
    });

    const accessToken = await client.getToken(tokenParams);
    
    console.log('Token response:', {
      access_token: 'REDACTED',
      token_type: accessToken.token.token_type,
      expires_in: accessToken.token.expires_in,
      refresh_token: 'REDACTED',
      scope: accessToken.token.scope
    });

    if (accessToken.token.refresh_token) {
      console.log('\nRefresh Token (save this):', accessToken.token.refresh_token);
      res.send('Success! Check your console for the refresh token.');
    } else {
      console.error('No refresh token received');
      res.status(400).send('No refresh token received');
    }

    setTimeout(() => process.exit(0), 1000);
  } catch (error) {
    console.error('Detailed error:', error);
    if (error.data) {
      console.error('Error response data:', error.data);
    }
    res.status(500).json({ 
      error: 'Failed to get token', 
      details: error.message,
      data: error.data
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('App error:', err);
  res.status(500).json({
    error: 'Server error',
    message: err.message
  });
});

app.listen(port, () => {
  console.log('\nServer is running!');
  console.log('\nPlease open this URL in your browser:', `http://localhost:${port}/login`);
  console.log('\nMake sure these values are correct:');
  console.log('Client ID:', config.client.id);
  console.log('Redirect URI:', REDIRECT_URI);
  console.log('Scopes:', SCOPES);
});