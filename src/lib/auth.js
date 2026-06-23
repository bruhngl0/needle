import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "needle_secret_key_123_abc";

export function getAuthenticatedUser(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}
