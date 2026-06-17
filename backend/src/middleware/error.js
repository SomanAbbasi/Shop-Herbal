import { allowedOrigins } from "../config/origins.js";

export default (err, req, res, next) => {
  console.error(err.stack);

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin.replace(/\/$/, ""))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
