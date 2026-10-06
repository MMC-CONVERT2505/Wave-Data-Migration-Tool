import "dotenv/config";
import session from "express-session";

const isProd = process.env.NODE_ENV === "production";

if (isProd && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in production");
}

// COOKIE_SAMESITE=none tab chahiye jab frontend aur backend alag domain pe hon
// (us case me secure cookie / HTTPS zaroori hai).
const sameSite = process.env.COOKIE_SAMESITE || "lax";

export default session({
  name: "wave.sid",
  secret: process.env.SESSION_SECRET || "wave-invoice-dev-secret",
  resave: false,
  saveUninitialized: false,
  proxy: isProd,
  cookie: {
    httpOnly: true,
    secure: isProd || sameSite === "none",
    sameSite,
    maxAge: 24 * 60 * 60 * 1000,
  },
});
