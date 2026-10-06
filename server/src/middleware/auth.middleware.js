export default function isAuthenticated(req, res, next) {
  if (!req.session?.accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}