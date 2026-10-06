import waveConfig from "../config/wave.config.js";
import { exchangeToken, getBusinesses } from "../services/wave.service.js";

const { AUTH_URL, CLIENT_ID, REDIRECT_URL, SCOPES, CLIENT_ORIGIN } = waveConfig;

export function redirectToWave(req, res) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URL,
    scope: SCOPES,
  });
  res.redirect(`${AUTH_URL}?${params.toString()}`);
}

export async function handleCallback(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "No code received from Wave" });

  try {
    const accessToken = await exchangeToken(code);
    req.session.accessToken = accessToken;
    res.redirect(`${CLIENT_ORIGIN}/dashboard`);
  } catch (err) {
    console.error("Token exchange error:", err.response?.data || err.message);
    res.status(500).json({ error: "Token exchange failed" });
  }
}

export function getStatus(req, res) {
  res.json({ authenticated: !!req.session?.accessToken });
}

export function logout(req, res) {
  req.session.destroy();
  res.json({ success: true });
}

// Manual API token se login — OAuth ka alternative.
// Token ko Wave GraphQL se validate karke session me store karte hain,
// baaki saare routes (businesses/invoices/payments) waisi hi behave karte
// hain jaisa OAuth session ke saath karte the.
export async function manualLogin(req, res) {
  const { apiToken } = req.body;

  if (!apiToken?.trim()) {
    return res.status(400).json({ error: "API token is required" });
  }

  try {
    const businesses = await getBusinesses(apiToken.trim());
    req.session.accessToken = apiToken.trim();
    res.json({ success: true, businesses });
  } catch (err) {
    console.error("manualLogin error:", err.response?.data || err.message);
    res.status(401).json({ error: "Invalid API token" });
  }
} 